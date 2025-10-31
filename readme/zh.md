# js0.site : 重构互联网

此项目旨在提供全新的 `HTTP-gRPC` 远程调用方案。项目尚处早期，但已取得阶段性进展。

## 目录

- [全球最小的 Protobuf 数据 JS 编解码器](#全球最小的-protobuf-数据-js-编解码器)
- [基于 Protobuf 生成 JS 编解码文件](#基于-protobuf-生成-js-编解码文件)
- [基于 Rust 库生成 Protobuf 文件](#基于-rust-库生成-protobuf-文件)
- [开发计划](#开发计划)
- [历史点滴](#历史点滴)

### 全球最小的 Protobuf 数据 JS 编解码器

**网址:** https://github.com/js0-site/js0-grpc/tree/main/js0.site/src

我们实现了一个极轻量级的 `proto` 数据 JS 编解码器 (`E.js` 和`D.js`)。

在对所有 Protobuf 数据类型进行编解码时，经过 `br` 压缩后，文件体积分别仅为 `949` 和 `789` 字节。对于一个简单的 `message Echo { string id = 1; }` 消息，经过摇树优化和 `br` 压缩后，编解码器体积分别仅为 `473` 和 `405` 字节，远小于市面上其他的 Protobuf JS 库。

具体用法请参考 [js0.site/test/proto](https://github.com/js0-site/js0-grpc/blob/dev/js0.site/test/proto)。

### 基于 Protobuf 生成 JS 编解码文件

**网址:** https://github.com/js0-site/js0-grpc/tree/main/proto2js

此工具从 `.proto` 文件生成 JS 编解码文件，并能自动合并结构相同的消息，通过重新导出(re-export) 的方式避免代码冗余，在摇树优化后能有效减小最终文件体积。

### 基于 Rust 库生成 Protobuf 文件

**网址:** https://github.com/js0-site/js0-grpc/tree/main/rust2proto

此工具从 Rust 代码生成 `.proto` 文件，可运行 `./rs2proto/test.sh` 查看效果。

### 开发计划

我们正在基于 `Rust` + `Tokio` 开发 `HTTP-gRPC` 请求网关，旨在将 Rust 函数无缝映射至前端调用，并自动生成所需的 JS 文件。

后续功能包括：
- 自动将多个 RPC 调用合并为单个 HTTP 请求。
- 支持 HTTP 对 gRPC 流的响应。

### 历史点滴

gRPC 最初由 Google 开发，内部代号为“Stubby”。多年来，它一直用于连接支撑 Google 基础设施的大量微服务。2015 年，Google 决定开源 Stubby 的一个新版本，并将其更名为 gRPC（gRPC 远程过程调用）。gRPC 中的“g”在不同版本中有不同的含义，例如 “good”、“green” 和 “goofy” 等，颇具趣味。