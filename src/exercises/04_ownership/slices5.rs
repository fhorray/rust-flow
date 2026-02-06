// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Slices - First Word

Description:
The classic "first word" problem.

Your task is to implement `first_word` which takes a string slice and returns a slice of the first word.
If there are no spaces, return the whole string.
*/

fn main() {
    let s = String::from("Hello World");
    let word = first_word(&s);
    assert_eq!(word, "Hello");

    let s2 = String::from("Rust");
    let word2 = first_word(&s2);
    assert_eq!(word2, "Rust");

    println!("Success!");
}

fn first_word(s: &str) -> &str {
    // TODO: Implement this function
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            // Found a space, return the slice up to this index
            return ""; // Fix this
        }
    }

    // No spaces found, return the whole string
    "" // Fix this
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
