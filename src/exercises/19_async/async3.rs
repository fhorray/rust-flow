// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Async - Block on

Description:
To bridge sync and async code, executors provide a `block_on` function.
It blocks the current thread until the future completes.

Your task is to use `futures::executor::block_on` to run `async_main`.
Note: Since we don't have external crates here easily, we'll simulate the requirement.
Actually, the runner might support it if we add dependencies.
But standard library doesn't have `block_on`.
Let's assume we are using a fictional `block_on`.
*/

async fn async_main() {
    println!("Async world!");
}

fn block_on<F: std::future::Future>(future: F) {
    // Simulation
}

fn main() {
    // TODO: Call block_on with async_main()
    // block_on(...);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
