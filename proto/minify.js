#!/usr/bin/env bun

import read from "@3-/read"
import write from "@3-/write"
import { existsSync } from "node:fs"
import { minify } from "oxc-minify"
import { join } from "node:path"
import { walkRel } from "@3-/walk"

const ROOT = import.meta.dirname,
	LIB = join(ROOT, "lib"),
	MIN = join(LIB, "min")

await (async () => {
	for (const fname of await walkRel(LIB, (i) => i == "min")) {
		if (!fname.endsWith(".js")) {
			continue
		}
		const lib_fp = join(LIB, fname),
			out_fp = join(MIN, fname)

		if (existsSync(out_fp)) {
			continue
		}
		const js = read(lib_fp),
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
			})
		write(out_fp + ".map", JSON.stringify(map))
		write(out_fp, code)
	}
})()
