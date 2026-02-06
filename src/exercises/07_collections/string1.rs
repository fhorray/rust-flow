// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Strings - Creation

Description:
Rust has two main string types: `&str` (string slice) and `String` (owned, heap-allocated).

Your task is to create a String `s` from the string literal "hello".
*/

fn main() {
    // TODO: Create a String from "hello"
    let s = "hello"; // This is &str

    // println!("{}", s);
    // assert_eq!(s, "hello"); // This works for &str too, but we want String

    // To check if it's String:
    // let _: String = s; // This will fail if s is &str
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
