> ./EMPTY.js

wrapAs = (primitive, arg)=>
  if [
    'i16'
    'i8'
    'u16'
    'u8'
  ].includes primitive
    return ' as _'
  return ''

INTO = '.into()'

wrapType = (filed) =>
  {
    array
    resolved_path
    primitive
    borrowed_ref
  } = filed
  if primitive
    return wrapAs(primitive)
  if array?.type.primitive == 'u8'
    return INTO
  if borrowed_ref
    if borrowed_ref.type.primitive
      return INTO
  switch resolved_path?.path
    when 'String'
      return INTO
    when 'Vec'
      { type } = resolved_path.args.angle_bracketed.args[0]
      if type.primitive == 'u8'
        return INTO
      else if type.resolved_path.path == 'String'
        return '.into_iter().map(|i|i.into()).collect()'
  return ''

export default (
  FuncName
  func_name
  args_type
  mod
  mod_func
  is_async
  inputs
  output
  return_type
  output_type
)=>
  args = []
  if inputs.length
    for [arg_name, arg_type] from inputs
      {
        resolved_path
        primitive
        borrowed_ref
        array
      } = arg_type
      arg = 'args.'+arg_name
      if primitive
        arg += wrapAs(primitive)
      if borrowed_ref
        arg = '&'+arg
      args.push(arg)

  call_return = 'Result<Self::Result>'
  if is_async
    call_return = 'impl Future<Output='+call_return+'>'
    _await = '.await'
  else
    _await = ''

  call = "#{mod}::#{mod_func}(#{args.join(', ')})#{_await}"

  if output and return_type
    [
      return_type
      gened_type
      return_feild_li
    ] = return_type
    {
      primitive
      resolved_path
      path
    } = output

    is_result = resolved_path?.path?.endsWith('::Result')

    if primitive
      call = """
#{output_type} {
    inner: #{call}#{wrapAs(primitive)}
  }
      """
    else if resolved_path
      if return_feild_li
        inner = return_feild_li.map(
          ([i, filed])=>
            i = i.split(' ')
            n = i.pop()
            n + ': r.'+n+wrapType(filed)
        )

        [
          prefix
          type
        ] = gened_type
        type = 'volo_gen::'+mod+'::'+type

        switch prefix
          when 'optional'
            inner = """
inner: match r {
      None => None,
      Some(r) => Some(#{type} {
        #{inner.join(',\n        ')}
      })
    }"""
          when 'repeated'
            inner = """
inner: r.into_iter().map(|r| #{type} {
      #{inner.join(',\n      ')}
    }).collect()
      """
          else
            inner = inner.join(',\n    ')
      else
        {
          args
        } = resolved_path
        if args
          {type}= args.angle_bracketed.args[0]
          {
            primitive
            tuple
          } = type
          if tuple
            if tuple.length
              inner = [1..tuple.length].map(
                (i)=> '_'+i+': r._'+i
              ).join(', ')
          else
            inner = 'inner: r'+wrapType(type)
        else
          inner = 'inner: r'+wrapType(output)


      call = """
let r = #{call}#{ if is_result then '?' else '' };\n  #{if is_result then 'Ok(' else ''}#{output_type} {
    #{inner}
  }#{if is_result then ')' else ''}"""
  else
    call += ';\n  Default::default()'

  if args_type == EMPTY
    args = '_'
  else
    args = 'args'

  return """
pub struct #{FuncName};

pub #{if is_async then 'async ' else ''}fn #{func_name}(#{args}: &#{args_type}) -> #{if is_result then 'anyhow::Result<' else ''}#{output_type or EMPTY}#{
if is_result then '>' else '' } {
  #{call}
}

impl Func for #{FuncName} {
  type Args = #{args_type};
  type Result = #{output_type or EMPTY};
  fn name() -> &'static str { "#{func_name}" }
}

impl #{if is_async then 'Async' else ''}Call for #{FuncName} {
  fn inner<H: Map, E: Ext>(req_args: ReqArgs<H, E, Self::Args>) -> #{call_return} {
    #{func_name}(req_args.args)#{_await}.into()
  }
}
"""
