// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Strings - Slicing

Description:
You can slice a string with `&s[start..end]`.
However, if you slice in the middle of a UTF-8 character, Rust will panic.

Your task is to safely slice the first character of "Здравствуйте".
Note that 'З' is 2 bytes long.
*/

fn main() {
    let s = "Здравствуйте";

    // TODO: Slice the first character properly
    let first_char_slice = &s[0..1]; // This will panic!

    println!("First char slice: {}", first_char_slice);
    assert_eq!(first_char_slice, "З");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
