#!/usr/bin/env bun

import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import gen from "./gen.js"

yargs(hideBin(process.argv))
  .scriptName("rs2proto")
  .command(
    '$0 [workdir]',
    'Generate gRPC protobuf files from a Rust crate.',
    (yargs) => {
      yargs.positional('workdir', {
        describe: 'The path to the Rust crate directory. Defaults to current directory.',
        type: 'string',
        default: process.cwd(),
      })
    },
    async (argv) => {
      await gen(argv.workdir)
    },
  )
  .help()
  .parse()
