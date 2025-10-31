import write from "@3-/write";
import { resolve, dirname, join } from "node:path";
import gen from "./gen.js";
import merge from "./merge.js";
import { cwd } from "node:process";
import { existsSync } from "node:fs";

export const IMPORT = [join(import.meta.dirname, "import")];

export default (
  proto_path,
  out_dir,
  include_dir,
  funcId = (i) => JSON.stringify(i),
) => {
  include_dir = new Set(IMPORT.concat(include_dir || []));

  if (!proto_path.startsWith("/")) {
    proto_path = resolve(join(cwd(), proto_path));
  }

  if (!existsSync(proto_path)) {
    throw new Error(`file not found: ${proto_path}`);
  }

  const proto_dir = dirname(proto_path);
  include_dir.add(proto_dir);
  proto_path = proto_path.slice(proto_dir.length + 1);

  const [proto_src, pkg_set, pkg] = merge(include_dir, proto_path);
  let r;

  try {
    r = gen(proto_src, pkg_set, funcId);
  } catch (e) {
    console.error("❌ " + proto_path);
    throw e;
  }

  r.forEach(([k, v]) => {
    write(join(out_dir, k + ".js"), v);
  });
  return pkg;
};
