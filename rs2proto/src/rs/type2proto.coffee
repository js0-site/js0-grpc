#!/usr/bin/env coffee

> ./primitiveType.js

argsStr = ({path, id, args})=>
  if path.endsWith '::Result'
    return genType(
      args.angle_bracketed.args[0].type
    )

  switch path
    when 'String'
      return 'string'
    when 'Vec'
      type =  args.angle_bracketed.args[0].type
      if type.primitive == 'u8'
        return 'bytes'
      prefix = 'repeated'
    when 'Option'
      type =  args.angle_bracketed.args[0].type
      prefix = 'optional'

  if prefix
    r = genType type
    if Array.isArray r
      r[0] = prefix
      return r
    else
      return prefix+' '+r

  result = ''

  if args
    {type} = args.angle_bracketed.args[0]

    if type.slice
      type = type.slice
      result = 'repeated '

    {
      primitive
      resolved_path
    } = type
    if primitive
      result += primitiveType(primitive)
    else if resolved_path
      result += argsStr(resolved_path)
  else
    return [result, path, id]
  return result

export genType = (type)=>
  {
    primitive
    resolved_path
    borrowed_ref
    impl_trait
    array
  } = type

  if array
    if array.type.primitive == 'u8'
      return 'bytes'

  if primitive
    return primitiveType(primitive)

  if resolved_path
    return argsStr(resolved_path)

  if borrowed_ref
    {
      type: {
        primitive
        slice
      }
    } = borrowed_ref
    if primitive
      return primitiveType(primitive)

    if slice
      {
        primitive
      } = slice
      if primitive == 'u8'
        return 'bytes'
      else
        return 'repeated '+primitiveType(primitive)

  if impl_trait
    for {
      trait_bound
    } from impl_trait
      return argsStr(trait_bound.trait)

  console.warn '⚠️ UNSUPPORTED TYPE',type

  return

export default ([name,type])=>
  prefix = genType type
  if prefix
    return prefix + ' ' + name
  return
