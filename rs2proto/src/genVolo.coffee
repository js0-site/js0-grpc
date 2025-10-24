> @3-/write
  path > join
  @3-/camel/Camel.js
  @3-/camel
  ./rs/genAdapter.js
  ./rs/EMPTY.js

wrapAs = (primitive, arg)=>
  if [
    'i16'
    'i8'
    'u16'
    'u8'
  ].includes primitive
    arg += ' as _'
  return arg

genFunc = (mod, func_id_map, adapter, grpc, http)=>([func_name_li, meta, root, return_type])=>
  func_name = func_name_li.join('_')
  func_id = func_id_map[camel func_name]
  http '\n    '+func_id+' => {\n'
  {
    inputs
    output
  } = meta.sig

  mod_func = func_name_li.join("::")

  if inputs.length
    args_type = "volo_gen::#{mod}::#{Camel func_name}Args"
    has_req = 1
  else
    args_type = EMPTY

  if output and return_type
    output_type = "volo_gen::#{mod}::#{return_type[0]}"

  {
    is_async
  } = meta.header

  funcCall = (reqArg)=>
    "adapter::#{func_name}(#{if has_req then reqArg else ''})#{if is_async then '.await' else ''}"

  http '      '+funcCall('req')+'\n'

  adapter genAdapter(
    func_name
    args_type
    mod
    mod_func
    is_async
    inputs
    output
    return_type
    output_type
  )

  grpc(
    """
\n  async fn #{func_name}(
      &self,
      #{if has_req then 'req' else '_'}: volo_grpc::Request<#{args_type}>,
    ) -> Result<
      Response<#{output_type}>,
      Status
    > {
      #{funcCall('req.into_inner()')}.into_response()
    }"""
  )
  http '    }'

  return

bindPush = (i)=>i.push.bind(i)

< (mod, func_li, dir_gen, func_id_map) =>

  adapter = []

  grpc = ["""
pub mod adapter;
pub mod http;
use volo_grpc::{Response, Status};
use rpc_adapter::IntoResponse;

pub struct S;

impl volo_gen::#{mod}::Api for S {\n
"""]

  http = [
    '''
use bytes::Bytes;
use http_grpc::Res;

use crate::adapter;

pub async fn run(call_id: u64, func_id: u32, args: &[u8]) -> Bytes {
  let res = Res { id: call_id };
  match func_id {
    '''
  ]

  gen = genFunc(
    mod
    func_id_map
    bindPush adapter
    bindPush grpc
    bindPush http
  )

  func_li.map(gen)
  http.push '''
    _ => {
      log::warn!("unkown func_id {func_id}");
      Default::default()
    }
  }
}
'''

  grpc.push '\n\n}'

  for [name, code] from [
    ['lib', grpc]
    ['adapter', adapter]
    ['http', http]
  ]
    write(
      join(dir_gen, 'volo', name+'.rs')
      code.join('').trimEnd()
    )
  return
