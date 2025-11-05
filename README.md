[English](#en) | [中文](#zh)

---

<a id="en"></a>

# js0.site : Refactoring The Internet

This project introduces a novel `HTTP-gRPC` remote call solution, currently in its early stages but with significant progress.

## Table of Contents

- [The World's Smallest JS Codec for Protobuf Data](#the-worlds-smallest-js-codec-for-protobuf-data)
- [Generating JS Codec Files from Protobuf](#generating-js-codec-files-from-protobuf)
- [Generating Protobuf Files from a Rust Crate](#generating-protobuf-files-from-a-rust-crate)
- [Under Development](#under-development)
- [A Little History](#a-little-history)

### The World's Smallest JS Codec for Protobuf Data

**URL:** https://github.com/js0-site/js0-grpc/tree/main/proto

An extremely lightweight JS codec for `proto` data has been implemented.

When decoding and encoding all Protobuf data types, the bundle sizes are `949` and `789` bytes respectively after `br` compression. For a simple `message Echo { string id = 1; }`, the sizes are merely `473` and `405` bytes after tree-shaking and `br` compression, which is substantially smaller than other Protobuf JavaScript libraries.

For usage details, refer to [proto/test/encode.js](https://github.com/js0-site/js0-grpc/blob/main/proto/test/encode.js).

### Generating JS Codec Files from Protobuf

**URL:** https://github.com/js0-site/js0-grpc/tree/main/proto2js

This tool generates JS codec files from `.proto` definitions. It automatically merges messages with identical structures by creating re-exports, thus avoiding code duplication and reducing the final bundle size after tree-shaking.

### Generating Protobuf Files from a Rust Crate

**URL:** https://github.com/js0-site/js0-grpc/tree/main/rust2proto

This utility generates `.proto` files from Rust code, demonstrated by running `./rs2proto/test.sh`.

### Under Development

An `HTTP-gRPC` request gateway is being developed using `Rust` + `Tokio`. This will enable seamless mapping of Rust functions to front-end web applications and automatically generate the required JS calling files.

Future enhancements include:
- Automatic batching of multiple RPC calls into a single HTTP request.
- Support for streaming gRPC responses over HTTP.

### A Little History

gRPC was originally developed by Google and was codenamed "Stubby." It was used in-house for many years to connect the vast number of microservices that power Google's infrastructure. In 2015, Google decided to open-source a new version of Stubby, and it was renamed gRPC (gRPC Remote Procedure Calls). The "g" in gRPC has had a few fun meanings over the years, with each release having a different "g" such as "good", "green", and "goofy".

---

## About

This project is an open-source component of [js0.site ⋅ Refactoring the Internet Plan](https://js0.site).

We are redefining the development paradigm of the Internet in a componentized way. Welcome to follow us:

* [Google Group](https://groups.google.com/g/js0-site)
* [x.com/Js0Site](https://x.com/Js0Site)
* [js0site.bsky.social](https://bsky.app/profile/js0site.bsky.social)

---

<a id="zh"></a>

# js0.site : 重构互联网

此项目旨在提供全新的 `HTTP-gRPC` 远程调用方案。项目尚处早期，但已取得阶段性进展。

## 目录

- [全球最小的 Protobuf 数据 JS 编解码器](#全球最小的-protobuf-数据-js-编解码器)
- [基于 Protobuf 生成 JS 编解码文件](#基于-protobuf-生成-js-编解码文件)
- [基于 Rust 库生成 Protobuf 文件](#基于-rust-库生成-protobuf-文件)
- [开发计划](#开发计划)
- [历史点滴](#历史点滴)

### 全球最小的 Protobuf 数据 JS 编解码器

**网址:** https://github.com/js0-site/js0-grpc/tree/main/proto

我们实现了一个极轻量级的 `proto` 数据 JS 编解码器。

在对所有 Protobuf 数据类型进行编解码时，经过 `br` 压缩后，文件体积分别仅为 `949` 和 `789` 字节。对于一个简单的 `message Echo { string id = 1; }` 消息，经过摇树优化和 `br` 压缩后，编解码器体积分别仅为 `473` 和 `405` 字节，远小于市面上其他的 Protobuf JS 库。

具体用法请参考 [proto/test/encode.js](https://github.com/js0-site/js0-grpc/blob/main/proto/test/encode.js)。

### 基于 Protobuf 生成 JS 编解码文件

**网址:** https://github.com/js0-site/js0-grpc/tree/main/proto2js

此工具从 `.proto` 文件生成 JS 编解码文件，并能自动合并结构相同的消息，通过重新导出(re-export)的方式避免代码冗余，在摇树优化后能有效减小最终文件体积。

### 基于 Rust 库生成 Protobuf 文件

**网址:** https://github.com/js0-site/js0-grpc/tree/main/rust2proto

此工具从 Rust 代码生成 `.proto` 文件，可运行 `./rs2proto/test.sh` 查看效果。

### 开发计划

我们正在基于 `Rust` + `Tokio` 开发 `HTTP-gRPC` 请求网关，旨在将 Rust 函数无缝映射至前端调用，并自动生成所需的 JS 文件。

后续功能包括：
- 自动将多个 RPC 调用合并为单个 HTTP 请求。
- 支持 HTTP 对 gRPC 流的响应。

### 历史点滴

gRPC 最初由 Google 开发，内部代号为“Stubby”。多年来，它一直用于连接支撑 Google 基础设施的大量微服务。2015年，Google 决定开源 Stubby 的一个新版本，并将其更名为 gRPC（gRPC 远程过程调用）。gRPC 中的“g”在不同版本中有不同的含义，例如 “good”、“green” 和 “goofy” 等，颇具趣味。

---

## 关于

本项目为 [js0.site ⋅ 重构互联网计划](https://js0.site) 的开源组件。

我们正在以组件化的方式重新定义互联网的开发范式，欢迎关注：

* [谷歌邮件列表](https://groups.google.com/g/js0-site)
* [x.com/Js0Site](https://x.com/Js0Site)
* [js0site.bsky.social](https://bsky.app/profile/js0site.bsky.social)
