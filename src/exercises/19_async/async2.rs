// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Async - Await

Description:
To get the value from a Future, you must `.await` it.
This can only be done inside an `async` function or block.

Your task is to call `get_number` and await it.
*/

use std::future::Future;

async fn get_number() -> i32 {
    42
}

async fn run() {
    // TODO: Await the future
    let num = get_number(); // Missing .await

    // println!("Got number: {}", num);
}

fn main() {
    // We can't run async code in main without a runtime, so we skip execution.
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main();
    }
}
