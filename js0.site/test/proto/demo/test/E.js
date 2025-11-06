import * as E from "js0.site/E.js";
import { $ as $E } from "js0.site/E.js";

export const EchoE = $E([E.string]);

export const Test1E = $E([E.int32, E.string]);

export const Test2E = $E([
  /* 1 */ E.double,
  /* 2 */ E.float,
  /* 3 */ E.int32,
  /* 4 */ E.int64,
  /* 5 */ E.uint32,
  /* 6 */ E.uint64,
  /* 7 */ E.sint32,
  /* 8 */ E.sint64,
  /* 9 */ E.fixed32,
  /* 10 */ E.fixed64,
  /* 11 */ E.sfixed32,
  /* 12 */ E.sfixed64,
  /* 13 */ E.bool,
  /* 14 */ E.string,
  /* 15 */ E.bytes,
  /* 16 */ E.doubleLi,
  /* 17 */ E.floatLi,
  /* 18 */ E.int32Li,
  /* 19 */ E.int64Li,
  /* 20 */ E.uint32Li,
  /* 21 */ E.uint64Li,
  /* 22 */ E.sint32Li,
  /* 23 */ E.sint64Li,
  /* 24 */ E.fixed32Li,
  /* 25 */ E.fixed64Li,
  /* 26 */ E.sfixed32Li,
  /* 27 */ E.sfixed64Li,
  /* 28 */ E.boolLi,
  /* 29 */ [E.string],
  /* 30 */ [E.bytes],
  /* 31 */ Test1E,
  /* 32 */ [Test1E],
  /* 33 */ E.map(E.int32, E.string),
  /* 34 */ E.int32,
  /* 35 */ E.int32Li,
]);
