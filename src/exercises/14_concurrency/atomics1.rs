// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Atomics

Description:
Atomic types allow safe shared access without locks for primitive types.
They are faster than Mutex.

Your task is to use `AtomicUsize` to count.
*/

use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::thread;

fn main() {
    let counter = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            // TODO: Increment using fetch_add
            // counter.fetch_add(..., ...);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", counter.load(Ordering::SeqCst));
    assert_eq!(counter.load(Ordering::SeqCst), 10);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
