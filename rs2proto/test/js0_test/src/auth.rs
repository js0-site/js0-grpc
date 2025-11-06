use aok::Result;

pub async fn login(username: impl AsRef<str>, password: &str, token: &[u8]) -> Result<u64> {
    dbg!(username.as_ref(), password);
    Ok(132)
}
