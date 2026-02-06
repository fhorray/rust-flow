// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: RwLock

Description:
`RwLock` (Read-Write Lock) allows multiple readers OR one writer.
It is more efficient than Mutex when reads are frequent.

Your task is to use `RwLock` to allow multiple threads to read the value, and one to write.
*/

use std::sync::{Arc, RwLock};
use std::thread;

fn main() {
    let lock = Arc::new(RwLock::new(5));
    let c_lock = Arc::clone(&lock);

    // Reader
    thread::spawn(move || {
        let r = c_lock.read().unwrap();
        println!("Reader 1: {}", *r);
    }).join().unwrap();

    // Writer
    {
        let mut w = lock.write().unwrap();
        *w += 1;
        println!("Writer changed to {}", *w);
    } // Write lock released

    // Reader
    {
        let r = lock.read().unwrap();
        println!("Reader 2: {}", *r);
        assert_eq!(*r, 6);
    }

    // Break it for the user
    // let mut w = lock.read().unwrap(); // Tried to write with read lock?
    // *w += 1;
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
