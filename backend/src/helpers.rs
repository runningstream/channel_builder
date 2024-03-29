/// Helper capabilities and constants that do not belong in any specific module
/// and are useful across modules.

use std::result::Result;
use std::fmt::Debug;
use std::time::Duration;
use std::thread::sleep;
use chrono;
use serde_json::Value;
use thiserror::Error;


pub static MIN_PASSWORD_LEN: usize = 6;
pub static VERSION: &str = env!("CARGO_PKG_VERSION");

/// An enum that differentiates frontend session types
#[derive(Debug, Clone)]
pub enum SessType { Frontend, Roku, Display }

impl SessType {
    pub fn get_max_age(&self) -> chrono::Duration {
        match *self {
            SessType::Frontend => chrono::Duration::days(5),
            SessType::Roku => chrono::Duration::days(365),
            SessType::Display => chrono::Duration::days(365),
        }
    }

    // The name of the session cookie for the interface
    pub fn get_session_cookie_name(&self) -> &'static str {
        match *self {
            SessType::Frontend => "session_fe",
            SessType::Roku => "session_ro",
            SessType::Display => "session_di",
        }
    }

    // The name of the alt session cookie for the interface
    // TODO Remove this in next version
    pub fn get_OLD_session_cookie_name(&self) -> &'static str {
        match *self {
            SessType::Frontend => "session",
            SessType::Roku => "session",
            SessType::Display => "session_di",
        }
    }
}


#[derive(Error, Debug, PartialEq)]
pub enum RetryErr {
    #[error("retries were exhausted")]
    RetriesExhausted,
}

/// Recursively retry a function call count times, sleeping between each.
pub fn retry_on_err
    <FUNC, RETTYPE, ERRTYPE>
    ( count: u32, sleep_len: Duration, func: FUNC)
    -> Result<RETTYPE, RetryErr>
where
    FUNC: Fn() -> Result<RETTYPE, ERRTYPE>, 
    ERRTYPE: Debug,
{
    if count <= 0 {
        warn!("Retries exhausted");
        return Err(RetryErr::RetriesExhausted);
    }

    func().or_else( |err| {
        warn!("Error with {} retries remaining: {:?}", count - 1, err);
        sleep(sleep_len);
        retry_on_err(count - 1, sleep_len, func)
    })
}


/// Build an XML string from serde JSON
pub fn build_xml(json: Value) -> String {
    match json {
        Value::Null => "".to_string(),
        Value::Bool(val) => format!("{}", val),
        Value::Number(val) => format!("{}", val),
        Value::String(val) => format!("{}", val),
        Value::Array(arr) => arr.iter()
            .map(|val| {
                format!("<array_elem>{}</array_elem>", build_xml(val.clone())) 
            }).collect::<String>(),
        Value::Object(map) => format!("<object>{}</object>", 
            map.iter().map(|(key, val)| {
                format!("<{}>{}</{}>", key, build_xml(val.clone()), key)
            }).collect::<String>()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::Cell;

    #[test]
    fn retry_fail() {
        fn always_fail() -> Result<(), ()> { Err(()) }

        let result = retry_on_err(1, Duration::new(0,100), always_fail);
        let expected = Err(RetryErr::RetriesExhausted);
        assert_eq!(expected, result);
    }

    #[test]
    fn retry_no_retries() {
        fn succeed() -> Result<u32, ()> { Ok(4) }

        let result = retry_on_err(0, Duration::new(0,100), succeed);
        let expected = Err(RetryErr::RetriesExhausted);
        assert_eq!(expected, result);
    }

    #[test]
    fn retry_4_retries_4_needed() {
        let count: Cell<u32> = Cell::new(0);
        let succeed = || {
            count.set(count.get() + 1);
            if count.get() >= 4 {
                Ok(count.get())
            } else {
                Err(())
            }
        };

        let result = retry_on_err(4, Duration::new(0,100), succeed);
        let expected = Ok(4);
        assert_eq!(expected, result);
    }

    #[test]
    fn retry_3_retries_4_needed() {
        let count: Cell<u32> = Cell::new(0);
        let succeed = || {
            count.set(count.get() + 1);
            if count.get() >= 4 {
                Ok(count.get())
            } else {
                Err(())
            }
        };

        let result = retry_on_err(3, Duration::new(0,100), succeed);
        let expected = Err(RetryErr::RetriesExhausted);
        assert_eq!(expected, result);
    }

    #[test]
    fn retry_succeed() {
        fn succeed() -> Result<u32, ()> { Ok(4) }

        let result = retry_on_err(1, Duration::new(0,100), succeed);
        let expected = Ok(4);
        assert_eq!(expected, result);
    }

    #[test]
    fn xml_mixed() {
        let json_input = Value::Array(
            vec![
                Value::Number(4.into()),
                Value::Number(5.into()),
                Value::String("Testing!".into()),
                Value::Null,
                Value::Bool(true),
            ],
        );
        let result = build_xml(json_input);
        let expected = "<array_elem>4</array_elem><array_elem>5</array_elem><array_elem>Testing!</array_elem><array_elem></array_elem><array_elem>true</array_elem>";
        assert_eq!(expected, result);
    }

    #[test]
    fn max_age_roku() {
        let st = SessType::Roku;
        assert_eq!(60*60*24*365, st.get_max_age().num_seconds());
    }

    #[test]
    fn max_age_frontend() {
        let st = SessType::Frontend;
        assert_eq!(60*60*24*5, st.get_max_age().num_seconds());
    }
}
