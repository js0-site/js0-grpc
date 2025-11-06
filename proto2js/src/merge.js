import read from "@3-/read";
import { existsSync } from "node:fs";
import { join } from "node:path";
import importLi from "./importLi.js";

const parseImport = (package2proto, path, findPath) => {
  path = findPath(path);
  if (!path) {
    return [[], ""];
  }

  const [import_li, txt, package_name] = importLi(read(path));

  package2proto.set(
    package_name,
    txt + (package2proto.get(package_name) || ""),
  );

  let n = 0;
  while (n < import_li.length) {
    const [_import_li, _package_name] = parseImport(
      package2proto,
      import_li[n],
      findPath,
    );
    import_li.push(..._import_li);
    ++n;
  }

  return [import_li, package_name];
};

const pkgWrap = (li, txt) => {
  for (;;) {
    const pkg = li.pop();
    if (pkg) {
      txt = "message " + pkg + "{\n" + txt + "\n}";
    } else {
      return txt;
    }
  }
};

export default (include_dir, proto_path) => {
  const processed = new Set(),
    findPath = (path) => {
      if (processed.has(path)) {
        return;
      }
      for (const dir of include_dir) {
        if (existsSync(join(dir, path))) {
          processed.add(path);
          return join(dir, path);
        }
      }
      throw new Error(`file not found: ${path}`);
    },
    package2proto = new Map(),
    pkg_set = new Set();

  const pkg = parseImport(package2proto, proto_path, findPath)[1];

  return [
    'syntax = "proto3";\n' +
      [...package2proto.entries()]
        .map(([pkg, txt]) => {
          pkg_set.add(pkg + ".");
          return pkgWrap(pkg.split("."), txt);
        })
        .join("\n")
        .replaceAll(/syntax\s*=\s*"proto3"\s*;/g, ""),
    pkg_set,
    pkg,
  ];
};
