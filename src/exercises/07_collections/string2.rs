// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Strings - Appending

Description:
`String` is mutable (like a `Vec<u8>`). You can append to it.

Your task is to make `s` mutable and append " world" to it.
*/

fn main() {
    let s = String::from("hello");

    // TODO: Make s mutable and push " world"
    // s.push_str(" world");

    println!("{}", s);
    // assert_eq!(s, "hello world");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
