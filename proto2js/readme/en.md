# @js0.site/proto2js : Convert Protobuf definitions to JavaScript modules

Converts `.proto` files into ES modules, enabling full type-safety and IntelliSense for gRPC services and messages in modern JavaScript environments.

## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Design](#design)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [A Little History](#a-little-history)

## Features

- **Modern JavaScript**: Generates ES modules using modern syntax.
- **Import Resolution**: Automatically parses and merges all imported `.proto` dependencies into a single definition.
- **Service & Message Generation**: Creates distinct modules for service definitions and message types (Encoders/Decoders).
- **Framework Agnostic**: Produces clean, dependency-free modules that can be used with any gRPC library or data serialization framework.
- **CLI Interface**: Simple and intuitive command-line interface for code generation.

## Usage

### Command Line

The primary way to use `proto2js` is via the `protogen` command.

**Syntax:**
```bash
protogen <proto_path> -o <out_dir> [-I <include_dir>...]
```

| Argument | Description |
| :--- | :--- |
| `proto_path` | Path to the root `.proto` file. |

| Option | Alias | Description | Required |
| :--- | :--- | :--- | :--- |
| `--out` | `-o` | Output directory for generated JavaScript files. | Yes |
| `--include` | `-I` | Directory for resolving `.proto` imports. Can be specified multiple times. The tool also automatically includes a set of standard Google protobuf types. | No |

### Example

Given the following `.proto` file in `test/demo/test.proto`:
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

Run the generator:
```bash
protogen test/demo/test.proto -o test/out
```

This will generate the following files:
- `test/out/test/Api.js` (Service definition)
- `test/out/test/EchoD.js` (Echo message decoder)
- `test/out/test/EchoE.js` (Echo message encoder)
- `test/out/test/InnerD.js` (Inner message decoder)
- `test/out/test/InnerE.js` (Inner message encoder)

## Design

The code generation process follows a clear, multi-stage pipeline:

1.  **Import Merging (`merge.js`)**: The process starts from a single entry `.proto` file. The tool recursively parses all `import` statements. It searches for these dependencies within the provided include paths (`-I`) and merges them into a single, cohesive protocol buffer definition in memory. This creates a virtual `.proto` file that contains all necessary types.

2.  **AST Parsing (`gen.js`)**: The merged definition is then parsed into an Abstract Syntax Tree (AST) using the `proto-parser` library.

3.  **Code Generation (`gen.js`)**: The tool traverses the AST.
    - For each `message`, it generates two modules: an `E` (Encoder) file and a `D` (Decoder) file. This separation allows for clean, unidirectional data flow.
    - For each `service`, it generates a module that defines the RPC methods, importing the relevant message encoders and decoders.
    - Type resolution is handled by `findType.js`, which correctly maps protobuf types to their corresponding generated JavaScript modules.

4.  **File Output**: The generated JavaScript code is written to the specified output directory, preserving the package structure from the `.proto` files. The `lib.js` file orchestrates this entire process.

## Technology Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Dependencies**:
  - `yargs`: For command-line argument parsing.
  - `proto-parser`: For converting `.proto` files into an AST.
  - `@3-/read`, `@3-/write`: Utility libraries for file system operations.

## Directory Structure

```
/
├───src/                # Source code
│   ├───cli.js          # Command-line interface logic
│   ├───gen.js          # Core code generation from AST
│   ├───lib.js          # Main library entry point
│   ├───merge.js        # .proto file import resolution and merging
│   └───import/         # Pre-bundled Google protobuf definitions
├───test/               # Test files and demos
│   ├───demo/
│   │   └───test.proto  # Example proto file
│   └───out/            # Output of test generation
├───package.json        # Project metadata and dependencies
└───README.md           # This file
```

## A Little History

Protocol Buffers (Protobuf) was developed at Google in the early 2000s as a high-performance, language-neutral, and platform-neutral mechanism for serializing structured data. It was created to be smaller, faster, and simpler than XML, which was the standard for data interchange at the time. After being used internally for many years as the foundation for Google's RPC systems and for data storage, Google open-sourced it in 2008. This project, `proto2js`, continues that spirit by bringing Protobuf's efficiency and strong typing to the world of modern JavaScript.
