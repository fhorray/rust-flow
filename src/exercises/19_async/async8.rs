// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Async - Send

Description:
Futures that are sent across threads (e.g., in `tokio::spawn`) must be `Send`.
This means they cannot hold non-Send types (like `Rc` or `MutexGuard`) across await points.

Your task is to identify why `not_send` is not `Send` and fix it (e.g. by dropping the non-send value before await, or using a Send-compatible type).
*/

use std::rc::Rc;

async fn not_send() {
    let rc = Rc::new(5);
    // await_something().await; // If we await here, rc is held across await
    println!("{}", rc);
}

// async fn await_something() {}

fn require_send<T: Send>(_: T) {}

fn main() {
    // require_send(not_send());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
