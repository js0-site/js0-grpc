#!/usr/bin/env bun

// import { uint32 as uint32E } from "js0.site/E.js";
// import { uint32 as uint32D } from "js0.site/D.js";
//
// console.log(uint32E([0]));
// console.log(uint32D([0]));

import { setReject } from "js0.site/f.js";
import { setBase } from "js0.site/~.js";

setReject((_send, url, opt, err) => {
  console.error(url, opt, err);
});

setBase("http://127.0.0.1:3334");

import { captchaNew } from "./js/js0_srv/Api.js";

console.log(await Promise.all([captchaNew(), captchaNew()]));
