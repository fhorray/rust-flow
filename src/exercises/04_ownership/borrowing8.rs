// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Borrowing - Ref Keyword

Description:
When pattern matching, you can use `ref` to borrow a part of a value instead of moving it.

Your task is to match on `opt` (Option<String>).
- If Some, borrow the string and print it (don't move it!).
- Then use `opt` again afterwards.
*/

fn main() {
    let opt = Some(String::from("hello"));

    match opt {
        // TODO: Use `ref s` to avoid moving the string out of `opt`
        Some(s) => println!("Got: {}", s),
        None => println!("None"),
    }

    // This fails because `opt` was partially moved in the match above
    println!("opt is still {:?}", opt);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
