// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Channels - Sending

Description:
Channels allow threads to communicate.
`mpsc::channel` creates a (Sender, Receiver) pair.

Your task is to send "Hello" down the channel.
*/

use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("Hello");
        // TODO: Send val
        // tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
