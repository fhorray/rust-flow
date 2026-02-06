// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Enums - If Let

Description:
You can use `if let` with any enum, not just `Option`.

Your task is to check if `msg` is `Message::Quit` using `if let`.
Print "Quitting!" if it matches.
*/

enum Message {
    Quit,
    Echo(String),
    Move,
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message::Quit;

    // TODO: Use if let to check for Quit
    // if let ... = msg { ... }

    // We can't force a compilation error easily here without writing wrong code.
    // So we just leave it as is, or we could add a check that fails?
    // Let's force the user to uncomment by checking a variable set inside.

    let mut success = false;

    // if let Message::Quit = msg { success = true; }

    assert!(success, "You didn't implement the check!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
