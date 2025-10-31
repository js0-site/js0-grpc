const TEXT = new TextEncoder(),
  utf8e = TEXT.encode.bind(TEXT),
  concat = (list) => {
    const totalLength = list.reduce((len, arr) => len + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of list) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  },
  put = /*@__NO_SIDE_EFFECTS__*/ (byteLength, attr) => {
    attr = "set" + attr;
    return (val) => {
      const buf = new DataView(new ArrayBuffer(byteLength));
      buf[attr](0, val, true);
      return new Uint8Array(buf.buffer);
    };
  },
  encodeTag = (field, wire) => uint32((field << 3) | wire),
  lengthDelimited = (encoder) => (val) => {
    const data = encoder(val);
    return concat([uint32(data.length), data]);
  },
  META = new Map(),
  getMeta = (encoder) => META.get(encoder),
  metaSet =
    /*@__NO_SIDE_EFFECTS__*/
    (func, wirte_type = 0) => {
      META.set(func, wirte_type);
      return func;
    },
  packed =
    /*@__NO_SIDE_EFFECTS__*/
    (encoder) => metaSet((li) => concat(li.map(encoder)), 2);

export const int32 = metaSet((v) => uint64(BigInt.asUintN(64, BigInt(v)))),
  int64 = int32,
  uint32 = metaSet((val) => {
    const r = [];
    let i = 0;
    while (val >= 0x80) {
      r[i++] = (val & 0x7f) | 0x80;
      val >>>= 7;
    }
    r[i] = val;
    return new Uint8Array(r);
  }),
  uint64 = metaSet((val) => {
    val = BigInt(val);
    const r = [];
    let i = 0;
    while (val >= 0x80n) {
      r[i++] = Number(val & 0x7fn) | 0x80;
      val >>= 7n;
    }
    r[i] = Number(val);
    return new Uint8Array(r);
  }),
  sint32 = metaSet((val) => uint32(((val << 1) ^ (val >> 31)) >>> 0)),
  sint64 = metaSet((val) => {
    val = BigInt(val);
    return uint64((val << 1n) ^ (val >> 63n));
  }),
  double = metaSet(put(8, "Float64"), 1),
  float = metaSet(put(4, "Float32"), 5),
  fixed32 = metaSet(put(4, "Uint32"), 5),
  fixed64 = metaSet((v) => put(8, "BigUint64")(BigInt(v)), 1),
  sfixed32 = metaSet(put(4, "Int32"), 5),
  sfixed64 = metaSet((v) => put(8, "BigInt64")(BigInt(v)), 1),
  bool = metaSet((b) => new Uint8Array([b ? 1 : 0])),
  string = metaSet(utf8e, 2),
  bytes = metaSet((v) => v, 2),
  boolLi = packed(bool),
  doubleLi = packed(double),
  fixed32Li = packed(fixed32),
  fixed64Li = packed(fixed64),
  floatLi = packed(float),
  int32Li = packed(int32),
  int64Li = packed(int64),
  sfixed32Li = packed(sfixed32),
  sfixed64Li = packed(sfixed64),
  sint32Li = packed(sint32),
  sint64Li = packed(sint64),
  uint32Li = packed(uint32),
  uint64Li = packed(uint64),
  map =
    /*@__NO_SIDE_EFFECTS__*/
    (keyencoder, valencoder) => {
      const key_wire_type = getMeta(keyencoder);
      const val_wire_type = getMeta(valencoder) ?? 2;

      const key_tag = encodeTag(1, key_wire_type);
      const val_tag = encodeTag(2, val_wire_type);
      const valDataEncoder =
        val_wire_type === 2 ? lengthDelimited(valencoder) : valencoder;

      const map_entryencoder = ([key, val]) => {
        const key_buf = concat([key_tag, keyencoder(key)]);
        const val_buf = concat([val_tag, valDataEncoder(val)]);
        return concat([key_buf, val_buf]);
      };
      return [map_entryencoder];
    },
  $ = (encode_li) => (val_li) =>
    concat(
      val_li.reduce((bufs, val, i) => {
        if (
          !val ||
          ((val instanceof Uint8Array || Array.isArray(val)) && !val.length)
        ) {
          return bufs;
        }

        const field = i + 1;
        const encoder = encode_li[i];

        if (Array.isArray(encoder)) {
          const e = encoder[0];
          const wire_type = getMeta(e) ?? 2;
          const tag = encodeTag(field, wire_type);
          const dataencoder = wire_type === 2 ? lengthDelimited(e) : e;
          const entry_bufs = val.map((item) =>
            concat([tag, dataencoder(item)]),
          );
          bufs.push(concat(entry_bufs));
        } else {
          const wire_type = getMeta(encoder) ?? 2;
          const tag = encodeTag(field, wire_type);
          const dataencoder =
            wire_type === 2 ? lengthDelimited(encoder) : encoder;
          bufs.push(concat([tag, dataencoder(val)]));
        }
        return bufs;
      }, []),
    );
