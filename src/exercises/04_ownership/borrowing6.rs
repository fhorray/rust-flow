// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Borrowing - Functions

Description:
Functions should generally take references if they don't need ownership.
This allows the caller to keep using the value.

Your task is to change `calculate_length` to take a reference `&String` instead of `String`.
You will also need to update the call site.
*/

fn main() {
    let s1 = String::from("hello");

    // TODO: Update the call
    let len = calculate_length(s1); // This moves s1 currently

    println!("The length of '{}' is {}.", s1, len); // Error: s1 is invalid here
}

// TODO: Update signature to take &String
fn calculate_length(s: String) -> usize {
    s.len()
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
