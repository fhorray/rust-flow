// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Error Handling - Panic

Description:
In Rust, there are two main ways to handle errors: unrecoverable (panic) and recoverable (Result).
`panic!` is a macro that stops execution, unwinds the stack, and prints an error message.
It should be used when the program is in an unrecoverable state or a contract violation has occurred.

Your task is to modify `generate_nametag_text` to `panic!` if the input `name` is empty.
The panic message should be "Empty names aren't allowed".

Hints:
1. `panic!("Message")`
*/

fn generate_nametag_text(name: String) -> String {
    if name.is_empty() {
        // TODO: Panic with the message "Empty names aren't allowed"
        String::new()
    } else {
        format!("Hi! My name is {}", name)
    }
}

fn main() {
    let _ = generate_nametag_text(String::from("Alice"));

    // This should panic:
    // let _ = generate_nametag_text(String::new());
    // let _ = generate_nametag_text(String::new());
}

// ???: When should you use `panic!` versus returning a `Result`?
// (Hint: Is an empty name a "bug" in the code or just bad user input?)

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_name() {
        assert_eq!(
            generate_nametag_text("Alice".to_string()),
            "Hi! My name is Alice"
        );
    }

    #[test]
    #[should_panic(expected = "Empty names aren't allowed")]
    fn test_empty_name() {
        generate_nametag_text(String::new());
    }
}
