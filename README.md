[English](#english) | [中文](#chinese)

<a id="english"></a>
## English

I am developing a brand new `HTTP-gRPC` remote call solution. The project is still in its early stages, but has already made considerable progress, which I'm sharing with you here.

### 1. The World's Smallest JS Codec for Protobuf Data

URL: https://github.com/js0-site/js0-grpc/tree/main/proto

First, I have implemented an extremely lightweight JS codec for `proto` data.

Running `js0-grpc/proto/test/bundle.js` yields the following results:

| file               | minify | zstd | gz   | br  |
|--------------------|--------|------|------|-----|
| demo/test/D.js     | 1896   | 1039 | 1031 | 949 |
| demo/test/E.js     | 1596   | 869  | 865  | 789 |
| demo/test/echoD.js | 892    | 526  | 523  | 473 |
| demo/test/echoE.js | 700    | 429  | 426  | 405 |

When decoding and encoding all data types, the sizes are only `949` and `789` bytes respectively after `br` compression.

If you only decode and encode some data types, for example:

```
message Echo {
  string id = 1;
}
```

After tree-shaking and `br` compression, the decoder and encoder sizes are only `473` and `405` bytes respectively. This is far smaller than any other `Protobuf` JavaScript codec library on the market.

For specific usage, please see [js0-grpc/blob/main/proto/test/encode.js](https://github.com/js0-site/js0-grpc/blob/main/proto/test/encode.js).

### 2. Generating JS Codec Files from Protobuf

URL: https://github.com/js0-site/js0-grpc/tree/main/proto2js

This tool can generate JS codec files based on `.proto` files.

For example, running `./proto2js/test/gen.js` on:

```
message Echo {
  string id = 1;
}
```

will generate its decoder `./proto2js/test/out/test/EchoD.js`:

```js
import { $, string } from "@js0.site/proto/D.js"

export default $([
  /* 1 msg */ string
])
```

and encoder `./proto2js/test/out/test/EchoE.js`:

```js
import { $, string } from "@js0.site/proto/E.js"

export default $([
  /* 1 msg */ string
])
```

This library automatically merges messages that have identical structures. Instead of redefining a duplicate structure, it generates `export { default } from '../the_other_same_struct_message.js'`, avoiding redundant code. This export statement is then eliminated by tree-shaking, further reducing the final size of the gRPC JS files.

### 3. Generating Protobuf Files from a Rust Crate

URL: https://github.com/js0-site/js0-grpc/tree/main/rust2proto

Run `./rs2proto/test.sh`.

The following Rust code:

```rs
mod rm;

pub use rm::rm as rm_renamed;

pub mod admin;

pub mod auth;

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

pub fn noargs() {}

pub fn args(
    bytes1: &[u8],
    bytes2: Vec<u8>,
    bytes3: impl AsRef<[u8]>,
    u64_1: &[u64],
    u64_2: Vec<u64>,
    option_u64: Option<u64>
) -> aok::Result<u8>{
    Ok(0)
}

pub use use_rename_test as renamed;
```

Can generate the following `.proto` file:

```protobuf
// AUTO GEN BY rs2proto
syntax = "proto3";
package js0_test;
import "google/protobuf/empty.proto";
message argsResult {
  uint32 data = 1;
}
message argsArgs {
  bytes bytes1 = 1;
  bytes bytes2 = 2;
  bytes bytes3 = 3;
  repeated uint64 u64_1 = 4;
  repeated uint64 u64_2 = 5;
  optional uint64 option_u64 = 6;
}
message addResult {
  uint64 data = 1;
}
message addArgs {
  uint64 left = 1;
  uint64 right = 2;
}
message authLoginResult {
  uint64 data = 1;
}
message authLoginArgs {
  string username = 1;
  string password = 2;
  bytes token = 3;
}
message adminUserNewArgs {
  uint64 id = 1;
  string name = 2;
}
message rmRenamedArgs {
  uint64 id = 1;
}
service Api {
  rpc rmRenamed(rmRenamedArgs) returns (google.protobuf.Empty);
  rpc adminUserNew(adminUserNewArgs) returns (google.protobuf.Empty);
  rpc authLogin(authLoginArgs) returns (authLoginResult);
  rpc add(addArgs) returns (addResult);
  rpc noargs(google.protobuf.Empty) returns (google.protobuf.Empty);
  rpc args(argsArgs) returns (argsResult);
}
```

### Under Development

I am currently using `Rust` + `Tokio` to implement an `HTTP-gRPC` request gateway, which can also automatically generate the corresponding JS calling files. The goal is to seamlessly map Rust functions to the front-end webpage.

Furthermore, it will support automatic merging of multiple requests into a single one (e.g., on the homepage, requests for a username and a message stream are two different RPC calls; they can be automatically merged into a single HTTP request via a throttling function like `setTimeout(()=>{mergePendingRpcCall()},10)`).

Additionally, support for HTTP responses to gRPC streams will be added, and more.

---
<a id="chinese"></a>
## 中文

我正在开发一个全新的 `HTTP-gRPC` 远程调用方案。

项目目前刚刚起步，不过已经取得了不少进展，在此与大家分享。

### 1. 全球最小的 Protobuf 数据 JS 编解码器

网址：https://github.com/js0-site/js0-grpc/tree/main/proto

首先，我已经实现了一个极其轻量级的、用于 `proto` 数据的 JS 编解码器。

运行 `js0-grpc/proto/test/bundle.js`，结果如下：

| file               | minify | zstd | gz   | br  |
|--------------------|--------|------|------|-----|
| demo/test/D.js     | 1896   | 1039 | 1031 | 949 |
| demo/test/E.js     | 1596   | 869  | 865  | 789 |
| demo/test/echoD.js | 892    | 526  | 523  | 473 |
| demo/test/echoE.js | 700    | 429  | 426  | 405 |

如果对所有数据类型进行解码和编码，在 `br` 压缩后，尺寸分别仅为 `949` 和 `789` 字节。

如果只对部分数据类型进行解码和编码，比如：

```
message Echo {
  string id = 1;
}
```

在“摇树优化”（tree-shaking）和 `br` 压缩后，解码器和编码器的尺寸分别仅为 `473` 和 `405` 字节，这个体积远小于市面上任何其他的 `Protobuf` JavaScript 编解码库。

具体用法参见 [js0-grpc/blob/main/proto/test/encode.js](https://github.com/js0-site/js0-grpc/blob/main/proto/test/encode.js)。

### 2. 基于 Protobuf 生成 JS 编解码文件

网址：https://github.com/js0-site/js0-grpc/tree/main/proto2js

此工具可基于 `.proto` 文件生成编解码器的 JS 文件。

比如，运行 `./proto2js/test/gen.js`，对于：

```
message Echo {
  string id = 1;
}
```

会生成其解码器 `./proto2js/test/out/test/EchoD.js`：

```js
import { $, string } from "@js0.site/proto/D.js"

export default $([
  /* 1 msg */ string
])
```

和编码器 `./proto2js/test/out/test/EchoE.js`：

```js
import { $, string } from "@js0.site/proto/E.js"

export default $([
  /* 1 msg */ string
])
```

该库会自动合并结构相同的消息体，用

```js
export { default } from '../the_other_same_struct_message.js'
```

来替代对同形消息体的重复定义，从而避免了冗余代码。在摇树优化（tree-shaking）过程中，此 `export` 语句会被自动移除，进而显著减小最终生成的 gRPC JS 文件的体积。

### 3. 基于 Rust 库生成 Protobuf 文件

网址：https://github.com/js0-site/js0-grpc/tree/main/rust2proto

运行 `./rs2proto/test.sh`。

如下的 Rust 代码：

```rs
mod rm;

pub use rm::rm as rm_renamed;

pub mod admin;

pub mod auth;

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

pub fn noargs() {}

pub fn args(
    bytes1: &[u8],
    bytes2: Vec<u8>,
    bytes3: impl AsRef<[u8]>,
    u64_1: &[u64],
    u64_2: Vec<u64>,
    option_u64: Option<u64>
) -> aok::Result<u8>{
    Ok(0)
}

pub use use_rename_test as renamed;
```

可以生成如下的 `.proto` 文件：

```protobuf
// AUTO GEN BY rs2proto
syntax = "proto3";
package js0_test;
import "google/protobuf/empty.proto";
message argsResult {
  uint32 data = 1;
}
message argsArgs {
  bytes bytes1 = 1;
  bytes bytes2 = 2;
  bytes bytes3 = 3;
  repeated uint64 u64_1 = 4;
  repeated uint64 u64_2 = 5;
  optional uint64 option_u64 = 6;
}
message addResult {
  uint64 data = 1;
}
message addArgs {
  uint64 left = 1;
  uint64 right = 2;
}
message authLoginResult {
  uint64 data = 1;
}
message authLoginArgs {
  string username = 1;
  string password = 2;
  bytes token = 3;
}
message adminUserNewArgs {
  uint64 id = 1;
  string name = 2;
}
message rmRenamedArgs {
  uint64 id = 1;
}
service Api {
  rpc rmRenamed(rmRenamedArgs) returns (google.protobuf.Empty);
  rpc adminUserNew(adminUserNewArgs) returns (google.protobuf.Empty);
  rpc authLogin(authLoginArgs) returns (authLoginResult);
  rpc add(addArgs) returns (addResult);
  rpc noargs(google.protobuf.Empty) returns (google.protobuf.Empty);
  rpc args(argsArgs) returns (argsResult);
}
```

### 正在开发

我正在用 `Rust` + `Tokio` 实现一个 `HTTP-gRPC` 请求转换网关，并能自动生成相应的 JS 调用文件，目标是把 Rust 函数无缝映射到前端网页上。

并且，将支持自动合并多个请求为一个请求（例如，首页上请求用户名和请求消息流是两个不同的 RPC 调用，可以通过类似 `setTimeout(()=>{mergePendingRpcCall()},10)` 的节流函数，自动将多个调用合并为一个 HTTP 请求）。

此外，还将加入 HTTP 对 gRPC 流响应的支持等等。
