export default (mod)=>
  """
use core::fmt::Debug;

use xrpc::{ParseError, Req, Response};
pub mod adapter;

#[cfg(feature = "http")]
pub mod http;

#[cfg(feature = "grpc")]
pub mod grpc;

pub async fn run() -> volo_boot::Result {
  volo_boot::init().await;

  #[cfg(feature = "grpc")]
  let grpc = volo_gen::#{mod}::ApiServer::new(grpc::S);

  #[cfg(all(feature = "grpc", feature = "http"))]
  tokio::try_join!(
    volo_boot::grpc(grpc, |server| server),
    volo_boot::http::<http::Api>(|router| router)
  )?;

  #[cfg(all(feature = "grpc", not(feature = "http")))]
  volo_boot::grpc(grpc, |server| server).await?;

  #[cfg(all(feature = "http", not(feature = "grpc")))]
  volo_boot::http::<http::Api>(|router| router).await?;

  Ok(())
}

struct Log;

fn req2log(req: &impl Req) -> String {
  req.get("x-real-ip").unwrap_or("-").into()
}

impl xrpc::Log for Log {
  fn info<T: Debug>(name: &str, req: &impl Req, _args: T, cost: u64) {
    log::info!("{} {name} {cost}ms", req2log(req));
  }

  fn response<T: Debug>(name: &str, req: &impl Req, _args: T, cost: u64, response: &Response) {
    log::info!("{} {name} {cost}ms {}", req2log(req), response.code);
  }

  fn error<T: Debug>(name: &str, req: &impl Req, args: T, cost: u64, err: &anyhow::Error) {
    log::error!("{} {name} {cost}ms {args:?} {err} ", req2log(req));
  }

  fn args_parse(name: &str, req: &impl Req, err: &ParseError) {
    log::error!("{} {name} {}", req2log(req), err.err);
  }
}
  """
