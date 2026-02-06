// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Enums - Methods

Description:
Just like structs, you can define methods on enums.

Your task is to implement a method `call` on `Message` that prints the message type.
*/

enum Message {
    Quit,
    Echo(String),
    Move,
    ChangeColor(i32, i32, i32),
}

impl Message {
    // TODO: Implement the `call` method
    // fn call(&self) { ... }
}

fn main() {
    let m = Message::Quit;
    // m.call();

    let m2 = Message::Echo(String::from("hello"));
    // m2.call();
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
