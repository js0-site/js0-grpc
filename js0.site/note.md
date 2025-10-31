# 文件

./src/f.js 对 fetch 的封装，方便调用
./src/~.js 配合代码生成的 protobuf 编解码，把 grpc 服务映射为 js 函数# 解决什么问题?





protobuf 生成 js 的体积过大, 一直是阻挠前端使用 grpc 的障碍.

比如 [Protobuf-ES: The Protocol Buffers TypeScript/JavaScript runtime we all deserve
](https://buf.build/blog/protobuf-es-the-protocol-buffers-typescript-javascript-runtime-we-all-deserve)

提到, `Google Protobuf` 生成的 js 文件体积是 `2.449MB`,

`Protobuf-ES` 优化后生成的 js 文件体积是 `1.067MB`

![](https://cdn.prod.website-files.com/6723e92f5d187330e4da8144/6747d26a4287b656e5d4aa61_pre-migration-2Z3PKPZG.png)

![](https://cdn.prod.website-files.com/6723e92f5d187330e4da8144/6747d26a68e9755d6d496161_post-migration-with-dts-RRRZUEYZ.png)

[Cap'n Web](https://github.com/cloudflare/capnweb)
```
The whole thing compresses (minify+gzip) to under 10kB with no dependencies.
```

# 特性

可以对编码和解码器单独导入和摇树优化,通常: 对于请求参数, 只需导入编码器; 对于响应结果, 只要导入解码器。分开导入, 让前端 javascript 代码的体积更小。

map 会反序列化为数组
比如 `map<bytes, string>`
会反序列化为 `[[Uint8Array([1,2,3]), "a"], [Uint8Array([4,5,6]), "b"]]`
因为 js 的对象的键只能是字符串,不能是字节码,解码为数组更加通用

`uint64` , `int64`, `sint64` 会反序列化为普通的 number, 如果数值大于 Number. MAX_SAFE_INTEGER 则会有失真; 如果想要避免失真, 可用 fixed64 (无符号 64 位整数)和 sfixed64(有符号 64 位整数), 这两个类型会反序列化为 Bigint

# 注意事项

vite rolldown 的压缩 js 的摇树优化有问题, 没法最小化导出代码

请配置使用 swc 压缩, 比如 vite 可以这样配置

先
```
npm i unplugin-swc @swc/core -D
```

然后

```
import swc from 'unplugin-swc'

export default {
  plugins: [
    // Vite plugin
    swc.vite(),
    // Rollup plugin
    swc.rollup(),
  ],
}
```

最后在项目目录配置 `.swcrc` 如下

```
{
  "$schema": "https://swc.rs/schema.json",
  "minify": true,
  "jsc": {
    "minify": {
      "compress": {
        "unused": true,
        "drop_console": true,
        "drop_debugger": true
      },
      "mangle": true
    }
  }
}
```