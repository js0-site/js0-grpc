#!/usr/bin/env bun

import { parse } from "proto-parser";
import { relative } from "node:path";
import findType from "./findType.js";

const BaseType = "BaseType";

const gen = (funcId, find, root_nested, prefix_li, pkg_li, exist) => {
  const pathCode = [];
  if (!root_nested) return pathCode;

  const addJs = pathCode.push.bind(pathCode);

  const rel =
    (prefix_li.length ? prefix_li.map(() => "..").join("/") : ".") + "/";

  const prefix_dir = rel + prefix_li.join("/");

  const _relativePath = (name) => {
    let r = relative(prefix_dir, rel + name);
    if (!r.startsWith(".")) {
      r = "./" + r;
    }
    return r;
  };

  const relativePath = (name_li) => _relativePath(name_li.join("/"));
  const relativePath$ = (name) => _relativePath(name.replaceAll("$", "/"));

  for (const val of Object.values(root_nested)) {
    const { name, syntaxType } = val;

    let prefix_name = prefix_li.concat([name]);
    const prefix_pkg = prefix_name.join(".") + ".";
    const not_pkg = pkg_li.every((pkg) => !pkg.startsWith(prefix_pkg));
    prefix_name = prefix_name.join("/");
    if (not_pkg) {
      console.log(prefix_name);
    }

    switch (syntaxType) {
      case "ServiceDefinition": {
        const code_li = [],
          proto_import = new Set(),
          protoImportAdd = (suffix, type_li) => {
            const requestTypeName = type_li.join("$");
            proto_import.add(
              requestTypeName +
                suffix +
                ' from "' +
                relativePath(type_li) +
                suffix +
                '.js"',
            );
            return requestTypeName + suffix;
          };

        Object.entries(val.methods).forEach(
          ([method, { requestType, responseType }]) => {
            [requestType] = find(requestType);
            [responseType] = find(responseType);

            code_li.push(
              method +
                " = $(" +
                funcId(method) +
                "," +
                protoImportAdd("E", requestType) +
                "," +
                protoImportAdd("D", responseType) +
                ")",
            );
          },
        );
        if (code_li.length) {
          addJs([
            prefix_name,
            ['$ from "js0.site/~.js"', ...proto_import]
              .toSorted()
              .map((i) => "import " + i)
              .join("\n") +
              "\nexport const _=undefined,\n" +
              code_li.join(",\n"),
          ]);
        }
        break;
      }
      case "EnumDefinition": {
        const t = [];
        for (const [k, v] of Object.entries(val.values)) {
          t.addJs(`${k} = ${v}`);
        }
        if (t.length) {
          addJs([prefix_name, "export const " + t.join(",\n  ")]);
        }
        break;
      }
      default: {
        const { fields, nested } = val;
        if (not_pkg) {
          let genJs,
            proto_import = new Set(),
            js_import = new Set(),
            args = [],
            comment,
            getType = (type, repeated) => {
              const typeStr = (type) => {
                if (repeated) {
                  if (["string", "bytes"].includes(type)) {
                    proto_import.add(type);
                    return "[" + type + "]";
                  }
                  type = type + "Li";
                  proto_import.add(type);
                  return type;
                }
                proto_import.add(type);
                return type;
              };
              let { value, syntaxType } = type;
              if (syntaxType == BaseType) {
                return typeStr(value);
              } else if (syntaxType == "Identifier") {
                const finded = find(type);
                if (finded) {
                  const findedSyntaxType = finded[1].syntaxType;
                  if (findedSyntaxType == "EnumDefinition") {
                    comment +=
                      " : " +
                      (repeated ? "[enum " + value + "]" : "enum " + value);
                    value = "int32";
                    if (repeated) value += "Li";
                    proto_import.add(value);
                    return value;
                  } else if (findedSyntaxType == "MessageDefinition") {
                    const name = finded[0].join("$");
                    js_import.add(name);
                    return repeated ? "[" + name + "]" : name;
                  }
                }
              }
              console.log("TODO : getType", type);
            };

          Object.values(fields).forEach((o) => {
            const { id, name, map, repeated } = o,
              type = getType(o.type, repeated);

            let args_type;

            if (map) {
              proto_import.add("map");
              args_type = "map(" + getType(o.keyType) + "," + type + ")";
            } else {
              args_type = type;
            }
            args[id - 1] = [id + " " + name, args_type];
          });

          if (proto_import.size) {
            proto_import =
              ", " + Array.from(proto_import).toSorted().join(", ");
          } else {
            proto_import = "";
          }

          const kind_key = args.map((i) => (i ? i[1] : "")).join(","),
            rename = exist.get(kind_key);

          if (rename) {
            genJs = (kind) => {
              comment = "";
              for (let i = 0; i < args.length; ++i) {
                const args_i = args[i];
                if (args_i) {
                  comment +=
                    "  " +
                    args_i[0] +
                    " " +
                    args_i[1].replaceAll("$", "/") +
                    "\n";
                } else {
                  comment += "  " + (1 + i) + " _\n";
                }
              }
              return (
                "/*\n" +
                comment +
                "*/\n" +
                'export { default } from "' +
                relativePath$(rename) +
                kind +
                '.js"'
              );
            };
          } else {
            exist.set(kind_key, prefix_name);
            if (args.length) {
              args =
                "\n  " +
                args
                  .map((i) => (i ? "/* " + i[0] + " */ " + i[1] : ""))
                  .join(",\n  ") +
                "\n";
            } else {
              args = "";
            }

            js_import = [...js_import].toSorted();
            genJs = (
              kind,
            ) => `import { $ as $${kind}${proto_import} } from "js0.site/${kind}.js"
${js_import.map((i) => "import " + i + ' from "' + relativePath$(i) + kind + '.js"').join("\n")}\nexport default $${kind}([${args}])`;
          }
          ["E", "D"].forEach((kind) => {
            addJs([prefix_name + kind, genJs(kind)]);
          });
        }

        if (nested) {
          addJs(
            ...gen(
              funcId,
              find,
              nested,
              prefix_li.concat([name]),
              pkg_li,
              new Map(),
            ),
          );
        }
      }
    }
  }
  return pathCode;
};

export default (proto, pkg_set, funcId) => {
  const parsed = parse(proto);

  if (parsed.error) {
    throw new Error(
      proto
        .split("\n")
        .map((line, pos) => {
          return `${pos + 1}: ${line}`;
        })
        .join("\n") +
        "\nline " +
        parsed.line +
        ": " +
        parsed.message,
    );
  }

  const { root } = parsed,
    { nested } = root;

  return gen(funcId, findType(".", root), nested, [], [...pkg_set], new Map());
};
