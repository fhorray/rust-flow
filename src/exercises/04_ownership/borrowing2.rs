// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Borrowing - Multiple References

Description:
You can have as many immutable references to a value as you like.
This is safe because none of them can modify the data.

Your task is to create two references, `r1` and `r2`, to `s`.
*/

fn main() {
    let s = String::from("hello");

    // TODO: Create reference r1
    let r1 = ""; // placeholder - should be &s

    // TODO: Create reference r2
    let r2 = ""; // placeholder - should be &s

    println!("r1: {}, r2: {}", r1, r2);
    assert_eq!(r1, "hello");
    assert_eq!(r2, "hello");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
