> @3-/camel
  path > join
  ./rs/return2rs.js
  ./rs/type2proto.js

EMPTY = 'google.protobuf.Empty'

args2rs = (func_name, inputs, unshift)=>
  if not inputs.length
    return
  name = func_name + 'Args'
  unshift 'message '+name+' {\n' + inputs.map(
    (name_type,pos)=>
      '  '+type2proto(
        name_type
      )+' = '+(pos+1)+';'
  ).join('\n') + '\n}'
  return name

< (name, func_li)=>
  proto_rpc = [
    'service Api {'
  ]

  unshift = proto_rpc.unshift.bind(proto_rpc)
  has_empty = 0

  exist = new Map
  for li from func_li
    [
      name_li
      sig: {inputs, output}
      mod
    ] = li
    func_name = camel(name_li.join('_'))
    t = '  rpc '+func_name+'('
    args = args2rs(
      func_name
      inputs # .filter ([i])=> not i.startsWith 'header_'
      unshift
    )
    t += args || EMPTY
    t += ') returns ('
    return_type = return2rs(
      func_name, output, unshift, mod, exist
    )
    if return_type
      li.push return_type
      t += return_type[0]
    else
      t += EMPTY
    t += ');'

    if not (args and return_type)
      has_empty = 1

    proto_rpc.push(t)

  if has_empty
    unshift 'import "google/protobuf/empty.proto";'

  return '// AUTO GEN BY rs2proto\nsyntax = "proto3";\npackage '+name+';\n' + proto_rpc.join('\n')+'\n}'
