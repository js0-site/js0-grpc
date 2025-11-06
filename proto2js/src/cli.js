#!/usr/bin/env bun

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import gen from "./gen.js";

const argv = yargs(hideBin(process.argv))
  .scriptName("protogen")
  .usage("$0 <proto_path> -o <out_dir> [-I <include_dir>]")
  .command(
    "$0 <proto_path>",
    "Generate JavaScript from a .proto file",
    (yargs) => {
      yargs.positional("proto_path", {
        describe: "Path to the .proto file",
        type: "string",
      });
    },
  )
  .option("out", {
    alias: "o",
    describe: "Output directory for generated files",
    type: "string",
    demandOption: true,
  })
  .option("include", {
    alias: "I",
    describe:
      "Include directory for proto imports. Can be specified multiple times.",
    type: "array",
  })
  .help().argv;

try {
  gen(argv.proto_path, argv.out, argv.include);
} catch (e) {
  console.error(e);
  process.exit(1);
}
