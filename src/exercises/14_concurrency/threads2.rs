// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Threads - JoinHandles

Description:
To ensure a thread finishes before the main thread exits, you should `join` its handle.
`spawn` returns a `JoinHandle`.

Your task is to collect the handle and call `join()` on it.
*/

use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        thread::sleep(Duration::from_millis(100));
        println!("Thread finished");
    });

    // TODO: Join the handle
    // handle.join().unwrap();
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
