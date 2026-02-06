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

use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

static THREAD_RAN: AtomicBool = AtomicBool::new(false);

fn main() {
    // TODO: Spawn a thread that:
    // 1. Prints "Hello from thread!"
    // 2. Sets THREAD_RAN to true using: THREAD_RAN.store(true, Ordering::SeqCst)

    // We sleep here to give the spawned thread a chance to run
    thread::sleep(Duration::from_millis(100));

    // Verify the thread ran
    assert!(THREAD_RAN.load(Ordering::SeqCst), "Thread did not run!");
    assert!(THREAD_RAN.load(Ordering::SeqCst), "Thread did not run!");
}

// ???: How do we share data between threads safely?
// (Notice we are using `AtomicBool` here - why not a regular `bool`?)

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
