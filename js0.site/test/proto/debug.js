#!/usr/bin/env bun
import * as E from "../src/encode.js";
import * as D from "../src/decode.js";
import { deepStrictEqual } from "node:assert";

const INT32_MIN = -2147483648;

const encode = E.$([E.sint32]);
const decode = D.$([D.sint32]);

const payload = [INT32_MIN];

const encoded = encode(payload);
const decoded = decode(encoded);

deepStrictEqual(decoded, payload);

console.log("Debug test passed!");
