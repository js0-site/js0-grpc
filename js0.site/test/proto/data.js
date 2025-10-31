#!/usr/bin/env bun

import * as Kind from "./demo/test/enum/Kind.js";
const { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } = Number,
  INT32_MAX = 2147483647,
  INT32_MIN = -2147483648,
  UINT32_MAX = 4294967295,
  UINT32_MIN = 0,
  SFIXED64_MAX = (2n ** 63n - 1n).toString(),
  SFIXED64_MIN = (-(2n ** 63n)).toString(),
  FIXED64_MAX = (2n ** 64n - 1n).toString();

export const payload = {
  f1: 1.23, // double
  f2: 4.56, // float
  f3: INT32_MIN, // int32
  f4: -8938, // int64
  f5: UINT32_MAX, // uint32
  f6: 10938, // uint64
  f7: INT32_MIN, // sint32
  f8: -93832, // sint64
  f9: UINT32_MAX, // fixed32
  f10: 93814, // fixed64
  f11: INT32_MIN, // sfixed32
  f12: -9386, // sfixed64
  f13: true, // bool
  f14: "hello world", // string
  f15: new Uint8Array([0, 1, 20, 35]), // bytes
  f16: [1.1, 2.2], // repeated double
  f17: [3.3, 4.4], // repeated float
  f18: [-9925, -633, 3232, 53322, INT32_MAX, INT32_MIN], // repeated int32
  f19: [-222732, -938182, 32812, 328331, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER], // repeated int64
  f20: [9938, 1033, UINT32_MAX, UINT32_MIN], // repeated uint32
  f21: [1122, 12992, MAX_SAFE_INTEGER], // repeated uint64
  f22: [-38938, -9838, 32234, 523411, INT32_MAX, INT32_MIN], // repeated sint32
  f23: [-9385, -9386, 98121, 81341, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER], // repeated sint64
  f24: [1938, 1832, UINT32_MAX, UINT32_MIN], // repeated fixed32
  f25: [19032, 2220, MAX_SAFE_INTEGER, 0, FIXED64_MAX], // repeated fixed64
  f26: [-9913, -5992, 32412, INT32_MAX, INT32_MIN], // repeated sfixed32
  f27: [
    -1993,
    -5994,
    23328,
    MAX_SAFE_INTEGER,
    MIN_SAFE_INTEGER,
    SFIXED64_MAX,
    SFIXED64_MIN,
  ], // repeated sfixed64
  f28: [true, false], // repeated bool
  f29: ["abc", "efghijklmn"], // repeated string
  f30: [new Uint8Array([0, 4, 5]), new Uint8Array([0, 6, 7])], // repeated bytes
  f31: { id: INT32_MAX, name: "John Doe" }, // Test1
  f32: [
    { id: 10322, name: "f32 one" },
    { id: 23222, name: "f32 two" },
    { id: INT32_MIN, name: "f32 min" },
  ], // repeated Test1
  f33: {
    232231: "f33 one",
    200938: "f33 two",
    [INT32_MAX]: "f33 max",
    [INT32_MIN]: "f33 min",
  }, // map<int32, string>
  f34: Kind.VIDEO, // Kind
  f35: [Kind.IMAGE, Kind.UNDEFINED, Kind.VIDEO], // repeated Kind
};

export const payload_verify = {
  ...payload,
  f10: BigInt(payload.f10),
  f12: BigInt(payload.f12),
  f15: payload.f15,
  f25: payload.f25.map(BigInt),
  f27: payload.f27.map(BigInt),
  f30: payload.f30,
  f31: [payload.f31.id, payload.f31.name],
  f32: payload.f32.map((v) => [v.id, v.name]),
  f33: Object.entries(payload.f33)
    .map(([k, v]) => [+k, v])
    .toSorted(),
};
