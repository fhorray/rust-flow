// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Mutex - Deadlocks

Description:
A deadlock happens when two threads wait for each other to release locks.
The code below deadlocks (or would if the order was just right, or if we try to lock twice in same thread).

Actually, simpler deadlock: Locking the same mutex twice in the same thread.
Your task is to fix the deadlock.
*/

use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);

    {
        let mut num = m.lock().unwrap();
        *num = 6;

        // TODO: This second lock causes a deadlock because the first lock is still held
        // let mut num2 = m.lock().unwrap();
        // *num2 = 7;
    } // Lock released here

    println!("Result: {:?}", m);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
