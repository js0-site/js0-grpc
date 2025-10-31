let REJECT;

const Fetch = (next) => {
  const send = async (url, opt) => {
    // console.log(url, opt);
    try {
      const r = await fetch(url, opt);
      if (
        [
          200,
          0, // no-cors will set status = 0
        ].includes(r.status)
      ) {
        return await next(r);
      }
      throw r;
    } catch (err) {
      return REJECT(send, url, opt, err);
    }
  };
  return send;
};

export const setReject = (reject) => {
    REJECT = reject;
  },
  fT = Fetch((r) => r.text()),
  fJ = Fetch((r) => r.json()),
  fB = Fetch(async (r) => new Uint8Array(await r.arrayBuffer())),
  //fetch reader stream
  fS = Fetch((r) => r.body.getReader());
