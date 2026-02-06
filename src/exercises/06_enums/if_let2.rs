// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Enums - If Let with Data

Description:
`if let` can also extract data from variants.

Your task is to extract the string from `Message::Echo` and print "Echoing: {s}".
*/

enum Message {
    Quit,
    Echo(String),
    Move,
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message::Echo(String::from("Hello World"));

    // TODO: Use if let to match Echo and extract the string
    // if let Message::Echo(s) = msg { ... }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
