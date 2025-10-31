/*@__NO_SIDE_EFFECTS__*/
const metaSet = (f, default_val) => {
  f._ = default_val;
  return f;
};

/*@__NO_SIDE_EFFECTS__*/
const liDecode = (decode) =>
  metaSet((buffer) => {
    const li = [],
      end = buffer.length;
    let pos = 0;
    while (pos < end) {
      const [value, nextPos] = decode(buffer, pos);
      li.push(value);
      pos = nextPos;
    }
    return li;
  }, []);

/*@__NO_SIDE_EFFECTS__*/
const v0_0 = (f) => metaSet(v0(f), 0);

/*@__NO_SIDE_EFFECTS__*/
const v0 = (f) => (buf) => f(buf, 0)[0];

/*@__NO_SIDE_EFFECTS__*/
const getNum = (byteLength, attr) => {
  attr = "get" + attr;
  /*@__NO_SIDE_EFFECTS__*/
  return (buf, pos = 0) => [
    new DataView(buf.buffer, buf.byteOffset + pos, byteLength)[attr](0, true),
    pos + byteLength,
  ];
};

const TEXT = new TextDecoder(),
  utf8d = TEXT.decode.bind(TEXT),
  varintLen = (buffer, pos) => {
    const len = buffer.length;
    while (pos < len) {
      if ((buffer[pos++] & 0x80) === 0) {
        return pos;
      }
    }
    return pos;
  },
  readTag = (buffer, position) => {
    const len = buffer.length;
    let tagValue = 0,
      shift = 0,
      byte;

    while (position < len) {
      byte = buffer[position];
      tagValue |= (byte & 0x7f) << shift;
      position++;
      if ((byte & 0x80) === 0) {
        return [tagValue & 7, tagValue >>> 3, position];
      }
      shift += 7;
      if (shift > 28) {
        return; // Malformed tag
      }
    }
  },
  unpack = (buffer) => {
    const result = [];
    const bufferLen = buffer.length;
    let pos = 0,
      tagInfo;
    while (pos < bufferLen) {
      tagInfo = readTag(buffer, pos);
      if (!tagInfo) {
        break;
      }
      const [wireType, fieldNumber, next] = tagInfo;
      pos = next;

      let dataEnd,
        dataStart = pos;
      switch (wireType) {
        case 0: // Varint
          dataEnd = varintLen(buffer, pos);
          break;
        case 1: // 64-bit
          dataEnd = pos + 8;
          break;
        case 2: {
          // Length-delimited
          const [len, posAfterLen] = decodeVarint32(buffer, pos);
          dataStart = posAfterLen;
          dataEnd = posAfterLen + len;
          break;
        }
        case 5: // 32-bit
          dataEnd = pos + 4;
          break;
        default:
          return result;
      }
      result.push([fieldNumber - 1, buffer.subarray(dataStart, dataEnd)]);
      pos = dataEnd;
    }
    return result;
  },
  decodeVarint32 = (buf, pos = 0) => {
    let result = 0,
      shift = 0,
      byte;
    do {
      byte = buf[pos++];
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80);
    return [result >>> 0, pos];
  },
  decodeFixed32 = getNum(4, "Uint32"),
  decodeFloat = getNum(4, "Float32"),
  decodeSfixed32 = getNum(4, "Int32"),
  decodeDouble = getNum(8, "Float64"),
  decodeFixed64 = getNum(8, "BigUint64"),
  decodeSfixed64 = getNum(8, "BigInt64"),
  decodeVarint64 = (buf, pos = 0) => {
    let result = 0n,
      shift = 0n,
      byte;
    do {
      byte = buf[pos++];
      result |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);
    return [result, pos];
  },
  decodeSint32 = (buf, pos) => {
    const [val, next] = decodeVarint32(buf, pos);
    return [(val >>> 1) ^ -(val & 1), next];
  },
  decodeBool = (buf, pos) => {
    const [val, next] = decodeVarint32(buf, pos);
    return [!!val, next];
  },
  decodeInt64Based = /*@__NO_SIDE_EFFECTS__*/ (decodeFn) => (buf, pos) => {
    const [val, next] = decodeVarint64(buf, pos);
    return [Number(decodeFn(val)), next];
  },
  decodeInt32 = decodeInt64Based((i) => BigInt.asIntN(32, i)),
  decodeInt64 = decodeInt64Based((i) => BigInt.asIntN(64, i)),
  decodeUint64 = decodeInt64Based((v) => v),
  /*@__NO_SIDE_EFFECTS__*/
  decodeSint64 = /*@__NO_SIDE_EFFECTS__*/ decodeInt64Based(
    (v) => (v >> 1n) ^ -(v & 1n),
  );

export const string = metaSet(utf8d, ""),
  dUint32 = decodeVarint32,
  bytes = metaSet((buf) => buf, /*@__PURE__*/ new Uint8Array()),
  bool = metaSet(v0(decodeBool), false),
  boolLi = liDecode(decodeBool),
  double = v0_0(decodeDouble),
  doubleLi = liDecode(decodeDouble),
  fixed32 = v0_0(decodeFixed32),
  fixed32Li = liDecode(decodeFixed32),
  fixed64 = v0_0(decodeFixed64),
  fixed64Li = liDecode(decodeFixed64),
  float = v0_0(decodeFloat),
  floatLi = liDecode(decodeFloat),
  int32 = v0_0(decodeInt32),
  int32Li = liDecode(decodeInt32),
  int64 = v0_0(decodeInt64),
  int64Li = liDecode(decodeInt64),
  sfixed32 = v0_0(decodeSfixed32),
  sfixed32Li = liDecode(decodeSfixed32),
  sfixed64 = v0_0(decodeSfixed64),
  sfixed64Li = liDecode(decodeSfixed64),
  sint32 = v0_0(decodeSint32),
  sint32Li = liDecode(decodeSint32),
  sint64 = v0_0(decodeSint64),
  sint64Li = liDecode(decodeSint64),
  uint32 = v0_0(dUint32),
  uint32Li = liDecode(dUint32),
  uint64 = v0_0(decodeUint64),
  uint64Li = liDecode(decodeUint64),
  $ = (type_li_in) => {
    const default_li = [];
    const type_li = [];
    const nopack_repeat = new Set();

    type_li_in.forEach((decode, i) => {
      if (Array.isArray(decode)) {
        default_li[i] = [];
        type_li[i] = decode[0];
        nopack_repeat.add(i);
      } else {
        default_li[i] = decode._;
        type_li[i] = decode;
      }
    });

    const decode_func = (buffer) => {
      const r = structuredClone(default_li);
      for (const [pos, buf] of unpack(buffer)) {
        const f = type_li[pos];
        if (f) {
          const t = f(buf);
          if (nopack_repeat.has(pos)) {
            r[pos].push(t);
          } else {
            r[pos] = t;
          }
        }
      }
      return r;
    };
    decode_func._ = default_li;
    return decode_func;
  },
  map = /*@__NO_SIDE_EFFECTS__*/ (key, val) => [$([key, val])];
