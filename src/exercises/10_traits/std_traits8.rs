// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Traits - AsRef

Description:
`AsRef` allows cheap reference-to-reference conversion.

Your task is to implement `byte_len` to accept anything that implements `AsRef<str>`.
This includes `String` and `&str`.
*/

// TODO: Fix signature
fn byte_len<T>(s: T) -> usize {
    // s.as_ref().len()
    0
}

fn main() {
    let s = "Hello";
    let string = String::from("Hello");

    // println!("{}", byte_len(s));
    // println!("{}", byte_len(string));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
