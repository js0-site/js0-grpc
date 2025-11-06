#!/usr/bin/env bun

import { Test2E } from "./demo/test/E.js";
import { Test2D } from "./demo/test/D.js";
import { ok, deepStrictEqual } from "node:assert";
import { payload_verify } from "./data.js";

const payload_arr = [],
  payload_verify_len = Object.keys(payload_verify).length;

for (let i = 0; ++i <= payload_verify_len; ) {
  payload_arr.push(payload_verify[`f${i}`]);
}

const data = Test2E(payload_arr);
const decoded = Test2D(data);
// console.log(decoded)

const expected = [...payload_arr];
// expected[26] = expected[26].map(BigInt)

for (let i = 0; ++i <= expected.length; ) {
  const key = `f${i}`;
  const decoded_value = decoded[i - 1];
  const expected_value = expected[i - 1];

  if (i === 2) {
    // f2: float
    ok(Math.abs(decoded_value - expected_value) < 0.0001, key);
  } else if (i === 17) {
    // f17: repeated float
    decoded_value.forEach((v, j) => {
      ok(Math.abs(v - expected_value[j]) < 0.0001, key);
    });
  } else if (i === 33) {
    deepStrictEqual(decoded_value.toSorted(), expected_value, key);
  } else {
    deepStrictEqual(decoded_value, expected_value, key);
  }
}
