> ./type2proto.js:@ > genType
  ./tupleType.js

typeLi = (index, id)=>
  type_li = []
  for i from index[id].inner.struct.kind.plain.fields
    type = index[i]
    if type.visibility == 'public'
      {
        struct_field
      } = type.inner
      type_li.push [
        type2proto([
          type.name
          struct_field
        ])
        struct_field
      ]
  return type_li


Result = 'Result'

export default (func_name, output, unshift, mod, exist)=>
  typeLi2Msg = (type, type_li)=>
    unshift 'message '+type+' {\n'+type_li.map(
      (i,pos)=>
        '  '+i+' = '+(pos+1)+';\n'
    ).join('')+'}'
    return

  if output
    {
      resolved_path
    } = output

    if resolved_path
      {
        path
      } = resolved_path
      if path.endsWith '::Void'
        return
      if path.endsWith('::'+Result)
        {tuple} = resolved_path.args.angle_bracketed.args[0].type
        if tuple
          if tuple.length == 0
            return
          name = func_name+Result
          typeLi2Msg(
            name
            tupleType(tuple)
          )
          return [name]

    gened_type = genType(
      output
    )

    is_array = Array.isArray(gened_type)

    if (
      not is_array
    ) or (
      gened_type[0]
    )
      name = func_name + Result
      if is_array
        gened_type_prefix = gened_type[0]
        type = gened_type[0] + ' ' + gened_type[1]
      else
        type = gened_type
      typeLi2Msg(name, [type+' inner'])
    else
      name = gened_type[1]

    if is_array
      [prefix, type, id] = gened_type
      {index} = mod

      e = exist.get(type)
      if e
        if e[0] != id
          type = type + '_' + id
          if not e[1].has(id)
            add_type = 1
      else
        exist.set type, [
          id
          new Set()
        ]
        add_type = 1

      if add_type
        type_li = typeLi(index,id)
        if not type_li.length
          return

      typeLi2Msg(type, type_li.map(([i])=>i))

      if not prefix
        name = type

    return [
      name
      gened_type
      type_li
    ]
  return
