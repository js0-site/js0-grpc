import { uint32 as uint32E } from "./E.js";
import { dUint32 } from "./D.js";
import { fS } from "./f.js";
import throttle from "./throttle.js";

let BASE,
  CALL_ID = 0;

export const setBase = (url) => {
  BASE = url;
};

const PENGING = [],
  CALLBACK = new Map(),
  merge = (li) => {
    let len = 0,
      offset = 0;
    li.forEach((item) => {
      len += item.length;
    });
    const result = new Uint8Array(len);
    li.forEach((item) => {
      const len = item.length;
      if (len) {
        result.set(item, offset);
        offset += len;
      }
    });
    return result;
  },
  U32_MAX = 4294967295,
  run = throttle(async () => {
    const li = PENGING.splice(0, PENGING.length),
      data = [],
      waiting = new Map(),
      byCallId = (id) => {
        waiting.delete(id);
        const resolve_reject = CALLBACK.get(id);
        CALLBACK.delete(id);
        return resolve_reject;
      },
      reject = (id, error) => byCallId(id)[0](error);

    li.forEach((t) => {
      const args_bin = t[3](t[2]);
      t = t.slice(0, 2);
      waiting.set(t[0], t[2]);
      t.push(args_bin.length);
      data.push(...t.map(uint32E), args_bin);
    });

    try {
      let buf = new Uint8Array();
      const stream = await fS(BASE, {
          method: "POST",
          body: merge(data),
        }),
        read = async () => {
          const { done, value } = await stream.read();
          if (done) {
            return 1;
          }
          buf = merge([buf, value]);
        },
        readN = async (n) => {
          const r = [];
          for (;;) {
            const [num, len] = dUint32(buf);
            if (len <= buf.length) {
              buf = buf.slice(len);
              r.push(num);
              if (!--n) {
                return r;
              }
              continue;
            }
            if (await read()) {
              return;
            }
          }
        };
      if (!(await read())) {
        out: for (;;) {
          let t = await readN(2);
          if (!t) {
            break;
          }
          const [call_id, code] = t;
          if (code == U32_MAX) {
            reject(call_id);
          } else {
            t = await readN(1);
            if (!t) break;
            for (;;) {
              if (buf.length < t) {
                if (await read()) {
                  break out;
                }
              } else {
                let data = buf.slice(0, t);
                buf = buf.slice(t);
                t = byCallId(call_id);
                if (code) {
                  t[0]([code, data]);
                } else {
                  t[1](t[2](data));
                }

                continue out;
              }
            }
          }
        }
      }
    } catch (e) {
      for (const [call_id, args] of waiting.entries()) {
        reject(call_id, [args, e]);
      }
      return;
    }
    waiting.keys().forEach((id) => reject(id));
  }, 9);

export default (func_id, E, D) =>
  async (...args) =>
    new Promise((resolve, reject) => {
      CALLBACK.set(CALL_ID, [reject, resolve, D]);
      PENGING.push([CALL_ID, func_id, args, E]);
      run();
      if (++CALL_ID > U32_MAX) {
        CALL_ID = 0;
      }
    });
