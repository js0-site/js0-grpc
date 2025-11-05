#!/usr/bin/env bun

import gen from "../src/lib.js";
import { join } from "node:path";

const ROOT = import.meta.dirname;

await gen(join(ROOT, "demo/test.proto"), join(ROOT, "out"));
