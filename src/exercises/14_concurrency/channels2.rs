// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Channels - Ownership

Description:
Sending a value down a channel transfers ownership.
You cannot use the value after sending it.

Your task is to fix the code by removing the usage of `val` after sending.
*/

use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
        // println!("val is {}", val); // Error: value used after move
    });

    let _ = rx.recv().unwrap();
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
