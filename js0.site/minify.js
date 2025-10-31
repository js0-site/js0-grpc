#!/usr/bin/env bun

import read from "@3-/read";
import write from "@3-/write";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { minify } from "oxc-minify";
import { join } from "node:path";
import { walkRel } from "@3-/walk";

const ROOT = import.meta.dirname,
  LIB = join(ROOT, "lib"),
  SRC = join(LIB, "src");

mkdirSync(SRC, { recursive: true });

await (async () => {
  for await (const fname of walkRel(LIB, (i) => i == "src")) {
    if (!fname.endsWith(".js")) {
      continue;
    }
    const lib_fp = join(LIB, fname),
      src_fp = join(SRC, fname),
      map_fp = lib_fp + ".map";

    if (existsSync(map_fp)) {
      continue;
    }
    copyFileSync(lib_fp, src_fp);

    const js = read(src_fp),
      { code, map } = minify(fname, js, {
        compress: {
          target: "esnext",
        },
        mangle: {
          toplevel: true,
        },
        codegen: {
          removeWhitespace: true,
        },
        sourcemap: true,
      });
    write(map_fp, JSON.stringify(map));
    write(lib_fp, code);
  }
})();
