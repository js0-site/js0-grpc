# js0-grpc: gRPC-Web 的极简实现

一个极简、无依赖的库，将 gRPC-Web 服务映射为原生 JavaScript 异步函数。

## 目录

- [功能特性](#功能特性)
- [使用演示](#使用演示)
- [设计思路](#设计思路)
- [技术堆栈](#技术堆栈)
- [目录结构](#目录结构)
- [相关故事](#相关故事)

## 功能特性

-   **零依赖**: 基于原生 `fetch` API 构建。
-   **极简设计**: 仅有两个核心函数，提供清晰、直接的实现方式。
-   **兼容 Protobuf**: 与 Protobuf 生成的编解码函数无缝协作。
-   **现代化**: 全面采用现代 JavaScript 特性 (ESM, async/await)。

## 使用演示

假设已在 `.proto` 文件中定义 gRPC 服务：

```proto
syntax = "proto3";

package hello;

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

你需要使用 Protobuf 编译器生成 `HelloRequest`、`HelloReply` 及其对应的编解码函数。

**客户端实现:**

```javascript
import grpc from './src/~.js';
import { setBase } from './src/~.js';

// 假设这些由 protobuf 工具生成
// 例如: const { HelloRequest, HelloReply } = require('./hello_pb.js');
// 并创建对应的编解码封装函数
const encodeHelloRequest = (args) => {
  // const request = new HelloRequest();
  // request.setName(args[0]);
  // return request.serializeBinary();
  return new Uint8Array(); // 示意
};

const decodeHelloReply = (binary) => {
  // const reply = HelloReply.deserializeBinary(binary);
  // return reply.getMessage();
  return "来自服务器的问候"; // 示意
};

// 1. 配置 gRPC-Web 代理的基础 URL
setBase('https://my-grpc-proxy.com/');

// 2. 创建服务函数
const sayHello = grpc(
  'hello.Greeter/SayHello', // 服务路径
  encodeHelloRequest,       // 请求编码器
  decodeHelloReply          // 响应解码器
);

// 3.像调用普通异步函数一样调用服务
const response = await sayHello('World');
console.log(response); // 输出: "来自服务器的问候"
```

## 设计思路

该库由两个模块构成：`f.js` 和 `~.js`。

-   **`f.js`**: 此模块是原生 `fetch` API 的轻量封装。它导出的 `fBin` 函数用于请求资源，并以 `Uint8Array` 格式返回响应体，这正是 Protobuf 二进制数据所需的格式。

-   **`~.js`**: 这是库的核心。
    1.  `setBase(url)`: 设置所有 gRPC 服务的全局基础 URL。
    2.  `grpc(name, E, D)`: 这是默认导出的高阶函数，它返回一个异步函数。
        -   `name`: gRPC 方法的完整路径 (例如 `package.Service/Method`)。
        -   `E` (Encoder): 编码器函数，接收客户端参数，返回 `Uint8Array` (序列化后的 Protobuf 消息)。
        -   `D` (Decoder): 解码器函数，接收来自服务端的 `Uint8Array`，返回反序列化后的 JavaScript 数据。

调用流程如下:
`服务函数(...args)` -> `编码器(args)` -> `fBin(基础URL + 服务名, 编码后数据)` -> `解码器(二进制响应)` -> `结果`

此设计抽象了 `fetch` 调用、头部信息和二进制数据处理的样板代码，提供了简洁的 RPC 体验。

## 技术堆栈

-   **协议**: gRPC-Web
-   **序列化**: Protobuf
-   **HTTP 客户端**: 原生 `fetch` API
-   **二进制数据**: `Uint8Array`
-   **模块系统**: ES Modules (ESM)

## 目录结构

```
/
├── src/
│   ├── f.js      # fetch 封装，用于处理二进制和文本数据
│   └── ~.js      # 核心的 gRPC 服务映射逻辑
├── test/
│   └── main.js   # 测试入口
├── package.json
└── README.md
```

## 相关故事

gRPC 是 Google 在 2015 年开源的技术，其名称是 "gRPC Remote Procedure Calls" 的递归缩写。它的前身是 Google 内部名为 "Stubby" 的项目，这是一个通用的 RPC 框架，十多年来一直用于连接 Google 内部运行的大量微服务。Stubby 为大规模和高性能而生。当 Google 决定创建一个对外版本时，他们基于 HTTP/2 等现代标准对其进行了重建，并命名为 gRPC。正是这段历史，使得 gRPC 以其高性能、语言无关和支持双向流等强大特性而闻名，成为许多微服务架构中替代传统 REST API 的选择。
