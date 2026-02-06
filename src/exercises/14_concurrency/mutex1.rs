// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Mutex - Basics

Description:
`Mutex` (Mutual Exclusion) allows only one thread to access data at a time.
You must `lock()` it to get access. The lock is released when the guard goes out of scope.

Your task is to:
1. Wrap `m` in an `Arc` (so it can be shared).
2. Inside the thread, lock the mutex and push 10.
*/

use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let m = Mutex::new(vec![1, 2, 3]);
    // TODO: Wrap in Arc
    // let m = Arc::new(m);

    // let m_clone = Arc::clone(&m);

    // thread::spawn(move || {
    //     // TODO: Lock and push
    //     let mut num = m_clone.lock().unwrap();
    //     num.push(10);
    // }).join().unwrap();

    // println!("m: {:?}", m.lock().unwrap()); // This won't work if m is moved into Arc without shadowing or if types mismatch
    // Actually, if we shadow m with Arc, we need to access lock on the Arc.
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
