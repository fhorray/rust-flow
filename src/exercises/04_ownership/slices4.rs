// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Slices - Ownership Rules

Description:
A slice is an immutable borrow. While it exists, you cannot modify the original collection.

The code below tries to clear the string `s` while `word` (a slice of `s`) is still in use.

Your task is to fix the code. You can move the usage of `word` before the call to `clear()`.
*/

fn main() {
    let mut s = String::from("hello world");

    let word = first_word(&s); // Immutable borrow occurs here

    s.clear(); // Mutable borrow occurs here (Error!)

    println!("The first word is: {}", word); // Immutable borrow used here
}

fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    &s[..]
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
