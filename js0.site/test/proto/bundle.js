#!/usr/bin/env bun

import treeShaking from "@3-/rolldown";
// import treeShaking from "./treeShaking.js"
import { init as initZstd, compress as zstdCompress } from "@bokuweb/zstd-wasm";
import Table from "cli-table3";
import { copyFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import write from "@3-/write";
import zlib from "node:zlib";

await initZstd();
const ROOT = import.meta.dirname;
const COMPRESS_LI = ["", "zstd", "gz", "br"];

const bundle = async (filepath) => {
    const out_path = join(ROOT, "bundle", filepath);

    mkdirSync(dirname(out_path), { recursive: true });

    copyFileSync(join(ROOT, filepath), out_path);

    const code = await treeShaking(
      out_path,
      {
        // treeshake: {
        //   manualPureFunctions: [],
        // },
      },
      true,
    );

    const size_li = [filepath],
      save = (code, ext) => {
        size_li.push(code.length);
        if (ext) {
          ext = "." + ext;
        }
        write(out_path + ext, code);
      };
    [
      code,
      zstdCompress(Buffer.from(code), 10),
      zlib.gzipSync(code),
      zlib.brotliCompressSync(code),
    ].forEach((bin, pos) => {
      save(bin, COMPRESS_LI[pos]);
    });

    return size_li;
  },
  bundleDir = (dir, file_name_li) =>
    Promise.all(file_name_li.map((i) => bundle(dir + "/" + i + ".js")));

const DECODE_ENCODE = ["D", "E"];

await (async () => {
  const table = new Table({
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "-",
      "bottom-mid": "|",
      "bottom-left": "|",
      "bottom-right": "|",
      left: "|",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "|",
      "right-mid": "",
      middle: "|",
    },
    style: {
      head: [],
      border: [],
    },
    head: ["file", "minify"].concat(COMPRESS_LI.slice(1)),
  });
  (
    await Promise.all(
      [DECODE_ENCODE, DECODE_ENCODE.map((i) => "echo" + i)].map((li) =>
        bundleDir("demo/test", li),
      ),
    )
  ).forEach((li) => {
    table.push(...li);
  });
  table.sort();
  let t = table.toString().split("\n");
  t.splice(1, 0, t.pop());
  t = t.join("\n");
  console.log(t);
  write(join(ROOT, "bundle.md"), t);
})();
