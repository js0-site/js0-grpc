# @js0.site/proto2js : 将 Protobuf 定义转换为 JavaScript 模块

将 `.proto` 文件转换为 ES 模块，为现代 JavaScript 环境中的 gRPC 服务和消息提供完整的类型安全和智能提示。

## 目录

- [功能](#功能)
- [使用方法](#使用方法)
- [设计思路](#设计思路)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [相关历史](#相关历史)

## 功能

- **现代 JavaScript**: 生成使用现代语法的 ES 模块。
- **导入解析**: 自动解析并合并所有导入的 `.proto` 依赖项，形成单一定义。
- **服务与消息生成**: 为服务定义和消息类型（编码器/解码器）创建独立的模块。
- **框架无关**: 生成纯净、无依赖的模块，可与任何 gRPC 库或数据序列化框架配合使用。
- **CLI 接口**: 提供简单直观的命令行工具用于代码生成。

## 使用方法

### 命令行

`proto2js` 的主要使用方式是通过 `protogen` 命令。

**语法:**
```bash
protogen <proto_path> -o <out_dir> [-I <include_dir>...]
```

| 参数 | 描述 |
| :--- | :--- |
| `proto_path` | 根 `.proto` 文件的路径。 |

| 选项 | 别名 | 描述 | 是否必需 |
| :--- | :--- | :--- | :--- |
| `--out` | `-o` | 生成的 JavaScript 文件的输出目录。 | 是 |
| `--include` | `-I` | 用于解析 `.proto` 导入的目录。可多次指定。工具也会自动包含一组标准的 Google Protobuf 类型。 | 否 |

### 示例

假设在 `test/demo/test.proto` 中有以下 `.proto` 文件：
```protobuf
syntax = "proto3";

package test;

message Echo {
  string msg = 1;
}

message Inner {
  Echo echo = 1;
}

service Api {
  rpc apiTest(Echo) returns (Inner);
}
```

运行生成器：
```bash
protogen test/demo/test.proto -o test/out
```

这将生成以下文件：
- `test/out/test/Api.js` (服务定义)
- `test/out/test/EchoD.js` (Echo 消息解码器)
- `test/out/test/EchoE.js` (Echo 消息编码器)
- `test/out/test/InnerD.js` (Inner 消息解码器)
- `test/out/test/InnerE.js` (Inner 消息编码器)

## 设计思路

代码生成过程遵循清晰的多阶段流程：

1.  **导入合并 (`merge.js`)**: 过程始于单个入口 `.proto` 文件。工具递归解析所有 `import` 语句，在提供的包含路径 (`-I`) 中搜索这些依赖项，并将它们合并成一个内存中的、统一的协议缓冲区定义。这会创建一个包含所有必要类型的虚拟 `.proto` 文件。

2.  **AST 解析 (`gen.js`)**: 接着，使用 `proto-parser` 库将合并后的定义解析为抽象语法树 (AST)。

3.  **代码生成 (`gen.js`)**: 工具遍历 AST。
    - 对于每个 `message`，生成两个模块：一个 `E` (Encoder) 文件和一个 `D` (Decoder) 文件。这种分离实现了清晰的单向数据流。
    - 对于每个 `service`，生成一个定义 RPC 方法的模块，并导入相关的消息编码器和解码器。
    - 类型解析由 `findType.js` 处理，它将 Protobuf 类型正确映射到其对应的生成 JavaScript 模块。

4.  **文件输出**: 生成的 JavaScript 代码被写入指定的输出目录，并保留 `.proto` 文件中的包结构。整个过程由 `lib.js` 文件统一调度。

## 技术栈

- **运行时**: [Bun](https://bun.sh/)
- **依赖项**:
  - `yargs`: 用于命令行参数解析。
  - `proto-parser`: 用于将 `.proto` 文件转换为 AST。
  - `@3-/read`, `@3-/write`: 用于文件系统操作的实用工具库。

## 目录结构

```
/
├───src/                # 源代码
│   ├───cli.js          # 命令行接口逻辑
│   ├───gen.js          # 从 AST 生成代码的核心逻辑
│   ├───lib.js          # 库的主入口点
│   ├───merge.js        # .proto 文件的导入解析与合并
│   └───import/         # 预置的 Google Protobuf 定义
├───test/               # 测试文件与演示
│   ├───demo/
│   │   └───test.proto  # 示例 proto 文件
│   └───out/            # 测试生成结果的输出目录
├───package.json        # 项目元数据与依赖
└───README.md           # 本文档
```

## 相关历史

Protocol Buffers (Protobuf) 由 Google 在 21 世纪初开发，作为一种高性能、语言中立、平台中立的结构化数据序列化机制。其创建初衷是为了提供比当时数据交换标准 XML 更小、更快、更简单的替代方案。在作为 Google RPC 系统和数据存储的基础被内部使用了多年之后，Google 于 2008 年将其开源。`proto2js` 项目延续了这一精神，将 Protobuf 的高效和强类型特性带入了现代 JavaScript 世界。
