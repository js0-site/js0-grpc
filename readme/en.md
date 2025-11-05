# js0.site : Refactoring The Internet

This project introduces a novel `HTTP-gRPC` remote call solution, currently in its early stages but with significant progress.

## Table of Contents

- [The World's Smallest JS Codec for Protobuf Data](#the-worlds-smallest-js-codec-for-protobuf-data)
- [Generating JS Codec Files from Protobuf](#generating-js-codec-files-from-protobuf)
- [Generating Protobuf Files from a Rust Crate](#generating-protobuf-files-from-a-rust-crate)
- [Under Development](#under-development)
- [A Little History](#a-little-history)

### The World's Smallest JS Codec for Protobuf Data

**URL:** https://github.com/js0-site/js0-grpc/tree/main/js0.site/src

We have implemented an extremely lightweight JS codec for `proto` data (`E.js` and `D.js`).

When decoding and encoding all Protobuf data types, the bundle sizes are `949` and `789` bytes respectively after `br` compression. For a simple `message Echo { string id = 1; }`, the sizes are merely `473` and `405` bytes after tree-shaking and `br` compression, which is substantially smaller than other Protobuf JavaScript libraries.

For usage details, refer to [js0.site/test/proto](https://github.com/js0-site/js0-grpc/blob/dev/js0.site/test/proto).

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
