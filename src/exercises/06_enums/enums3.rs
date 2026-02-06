// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Enums - Instantiation

Description:
Your task is to create instances of each variant of the `Message` enum defined below.
*/

#[derive(Debug)]
enum Message {
    Quit,
    Echo(String),
    Move { x: i32, y: i32 },
    ChangeColor(i32, i32, i32),
}

fn main() {
    // TODO: Create an instance of Quit
    let msg_quit = Message::Quit;

    // TODO: Create an instance of Echo with "hello"
    // let msg_echo = ...;

    // TODO: Create an instance of Move with x: 10, y: 30
    // let msg_move = ...;

    // TODO: Create an instance of ChangeColor with 0, 255, 255
    // let msg_color = ...;

    // println!("{:?}", msg_echo); // Uncomment when ready
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
