// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Enums - Matching

Description:
The most powerful feature of enums is using `match` to handle each variant.

Your task is to complete the `process` function which matches on `Message` and prints:
- Quit -> "Quitting"
- Echo(s) -> "Echoing: {s}"
- Move { x, y } -> "Moving to {x}, {y}"
- ChangeColor(r, g, b) -> "Changing color to {r}, {g}, {b}"
*/

enum Message {
    Quit,
    Echo(String),
    Move { x: i32, y: i32 },
    ChangeColor(i32, i32, i32),
}

fn process(msg: Message) {
    // TODO: Match on msg
    match msg {
        Message::Quit => println!("Quitting"),
        // Handle the rest
        _ => {},
    }
}

fn main() {
    let messages = [
        Message::Quit,
        Message::Echo(String::from("hello")),
        Message::Move { x: 10, y: 30 },
        Message::ChangeColor(255, 0, 255),
    ];

    for msg in messages {
        process(msg);
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
