// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Shared State

Description:
Use `Arc` and `Mutex` to share a counter between 10 threads.
Each thread should increment the counter.

Your task is to implement the thread body.
*/

use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            // TODO: Increment counter
            // let mut num = ...;
            // *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    // println!("Result: {}", *counter.lock().unwrap());
    // assert_eq!(*counter.lock().unwrap(), 10);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
