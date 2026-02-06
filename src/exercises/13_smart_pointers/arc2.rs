// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Smart Pointers - Arc and Mutex

Description:
To mutate shared data across threads, we need `Arc<Mutex<T>>`.
`Arc` provides shared ownership, `Mutex` provides exclusive access.

Your task is to fix the code to increment the counter in 10 threads.
*/

use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            // TODO: Lock the mutex and increment
            // let mut num = ...;
            // *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    // println!("Result: {}", *counter.lock().unwrap());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
