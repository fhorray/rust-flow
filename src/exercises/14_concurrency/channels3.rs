// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Channels - Multiple Producers

Description:
`mpsc` stands for "Multiple Producer, Single Consumer".
You can clone the sender (`tx`) to have multiple threads sending to the same receiver.

Your task is to clone `tx` and spawn two threads, each sending messages.
*/

use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    let tx1 = tx.clone();
    thread::spawn(move || {
        // TODO: Send messages using tx1
        // tx1.send("hi from tx1").unwrap();
    });

    thread::spawn(move || {
        // TODO: Send messages using tx
        // tx.send("hi from tx").unwrap();
    });

    for received in rx {
        println!("Got: {}", received);
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
