#!/usr/bin/env coffee

export default (type) =>
  (
    switch type
      when 'bool' then 'bool'
      when 'i8', 'i16' then 'sint32'
      when 'i32' then 'sint32'
      when 'i64' then 'sint64'
      when 'u8', 'u16' then 'uint32'
      when 'u32' then 'uint32'
      when 'u64' then 'uint64'
      when 'f32' then 'float'
      when 'f64' then 'double'
      when 'str','String' then 'string'
      # when '[u8]', 'Vec<u8>' then 'bytes'
      else
        throw new Error "UnknownType: #{type}"
  )
