> ./rs/EMPTY.js
  ./rs/genAdapter.js
  ./rs/srcLib.js
  @3-/camel
  @3-/camel/Camel.js
  @3-/write
  @3-/read
  path > join
  fs > existsSync

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

  FuncName = Camel func_name
  if inputs.length
    args_type = "volo_gen::#{mod}::#{FuncName}Args"
  else
    args_type = EMPTY

  if output and return_type
    output_type = "volo_gen::#{mod}::#{return_type[0]}"

  {
    is_async
  } = meta.header

  funcCall = (reqArg)=>
    """
adapter::#{FuncName}::call::<Log, _, _>(#{reqArg})#{if is_async then '.await' else ''}"""

  http '        '+funcCall('(req, parse(args))')+'.into()\n'

  adapter genAdapter(
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
  )

  grpc(
    """
\n  async fn #{func_name}(
    &self,
    req: volo_grpc::Request<#{args_type}>,
  ) -> Result<
    Response<#{output_type}>,
    Status
  > {
    #{funcCall('split(req)')}.into_response()
  }"""
  )
  http '    }'

  return

bindPush = (i)=>i.push.bind(i)

< (mod, func_li, dir_gen, func_id_map) =>

  adapter = [
    """
use xrpc::{AsyncCall, Call, Ext, Func, Map, ReqArgs, Result};
\n
    """
  ]

  grpc = ["""
use volo_grpc::{Response, Status};
use xrpc::{AsyncCall, Call, IntoResponse, volo::grpc::split};
use crate::{adapter, Log};

pub struct S;

impl volo_gen::#{mod}::Api for S {\n
"""]

  http = [
    '''
use volo_http::Bytes;
use http_grpc::Response;
use xrpc::{
  AsyncCall, Call,
  volo::http::{Req, parse},
};

use crate::{Log, adapter};

pub struct Api;

impl http_grpc::Grpc for Api {
  async fn run(req: Req, func_id: u32, args: Bytes) -> Option<Response> {
    Some(match func_id {
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
\n      _ => {
        log::warn!("unkown func_id {func_id}");
        return None
      }
    })
  }
}
'''

  grpc.push '\n\n}'

  volo_dir = join(dir_gen, 'volo')

  genLib = =>
    lib_rs = join(dir_gen, 'volo', 'lib.rs')
    if existsSync(lib_rs)
      txt = read lib_rs
      if txt.includes 'mod grpc;'
        return
    write(
      join volo_dir, 'lib.rs'
      srcLib(mod)
    )
    return

  ob = {
    grpc
    adapter
    http
  }

  genLib()

  for [name, code] from Object.entries ob
    write(
      join(volo_dir, name+'.rs')
      '//  DON\'T EDIT ! AUTOGEN BY rs2proto\n\n'+code.join('').trimEnd()
    )
  return
