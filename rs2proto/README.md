# @3-/rs2proto

`header_` 为前缀的参数，会从请求头的 `header` 中获取。

比如 `header_x_read_ip: &str` 为获取请求头的 `x-read-ip`；如果不存在，会传入空字符串。
