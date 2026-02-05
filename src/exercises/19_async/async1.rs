// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Async - Future

Description:
Asynchronous programming allows you to handle many tasks concurrently without creating a thread for each one.
In Rust, an `async fn` returns a `Future`, which is a value that represents a computation that may finish later.
Just calling an `async fn` doesn't run it; you need to poll it (usually via an executor or `.await`).

Your task is to define an async function named `hello` that returns the string literal "world".

Hints:
1. Syntax: `async fn name() -> Type { ... }`
*/

use std::future::Future;

// TODO: Define async function `hello`
// async fn hello() ...

fn main() {
    let future = hello();
    // In a real program, we would use an executor like:
    // block_on(future);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hello_returns_future() {
        let f = hello();
        // Check that it implements Future
        fn assert_future<T: Future<Output = &'static str>>(_: T) {}
        assert_future(f);
    }
}
