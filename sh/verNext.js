#!/usr/bin/env bun

import read from "@3-/read";
import write from "@3-/write";
import { join } from "node:path";
import { cwd } from "node:process";

const ROOT = cwd(),
  LIB = join(ROOT, "lib"),
  renameSrc = (f) => f.replace("src/", "");
(() => {
  const package_json = "package.json",
    root_package_json = join(ROOT, package_json),
    json = JSON.parse(read(root_package_json));

  const version = json.version.split(".").map((i) => +i);
  ++version[2];
  json.version = version.join(".");
  write(root_package_json, JSON.stringify(json, null, 2));

  delete json.devDependencies;
  json.files = ["*"];

  Object.entries(json.exports).forEach(([k, v]) => {
    json.exports[k] = renameSrc(v);
  });

  write(join(LIB, package_json), JSON.stringify(json));

  // // README
  // const readme = join(LIB, "README.md");
  // write(
  //   readme,
  //   read(readme)
  //     .replace("(#en)", "(#user-content-en)")
  //     .replace("(#zh)", "(#user-content-zh)"),
  // );
})();
