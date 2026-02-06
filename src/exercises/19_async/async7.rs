// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Async - Traits

Description:
Async traits are not natively supported (yet) without boxing or crates like `async-trait`.
However, you can manually define a method that returns a `BoxFuture`.

Your task is to fix the trait definition.
*/

use std::future::Future;
use std::pin::Pin;

trait AsyncTrait {
    // TODO: Return Pin<Box<dyn Future<Output = ()>>>
    fn run(&self) -> Pin<Box<dyn Future<Output = ()>>>;
}

fn main() {}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
