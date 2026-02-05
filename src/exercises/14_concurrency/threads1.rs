// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Threads - Spawning

Description:
Threads allow you to run code in parallel.
In Rust, you can spawn a new thread using `std::thread::spawn`.
The function takes a closure containing the code to run in the new thread.
Note that if the main thread finishes, all spawned threads are shut down immediately, so we often need to wait for them.

Your task is to spawn a thread that prints "Hello from thread!".

Hints:
1. `thread::spawn(|| { ... })`
*/

use std::thread;
use std::time::Duration;

fn main() {
    // TODO: Spawn a thread that prints "Hello from thread!"

    // We sleep here to give the spawned thread a chance to run before the main thread ends.
    // (In later exercises, we'll learn a better way to do this using `join` handles).
    thread::sleep(Duration::from_millis(100));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
