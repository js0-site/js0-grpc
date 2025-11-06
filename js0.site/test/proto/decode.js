#!/usr/bin/env bun

// import { Test2D } from "./bundle/demo/decode.js"
import { Test2D } from "./demo/test/D.js";
import path from "node:path";
import protobuf from "protobufjs";
import { ok, deepStrictEqual } from "node:assert";
import { payload, payload_verify } from "./data.js";

const encode = (t, payload) => t.encode(t.create(payload)).finish(),
  root = await protobuf.load(
    path.resolve(import.meta.dirname, "demo/test.proto"),
  ),
  Test2 = root.lookupType("demo.Test2");

const data = encode(Test2, payload);
const decoded = Test2D(data);
// console.log(decoded)

for (let i = 0; ++i <= Object.keys(payload_verify).length; ) {
  const key = "f" + i;
  const decoded_value = decoded[i - 1];
  const expected_value = payload_verify[key];

  if (i === 2) {
    // f2: float
    ok(Math.abs(decoded_value - expected_value) < 0.0001, key);
  } else if (i === 17) {
    // f17: repeated float
    decoded_value.forEach((v, j) => {
      ok(Math.abs(v - expected_value[j]) < 0.0001);
    });
  } else if (i === 33) {
    deepStrictEqual(decoded_value.toSorted(), expected_value, key);
  } else {
    deepStrictEqual(decoded_value, expected_value, key);
  }
}
