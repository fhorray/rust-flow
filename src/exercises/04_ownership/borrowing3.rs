// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Borrowing - Mutable References

Description:
To modify a borrowed value, you need a mutable reference (`&mut`).
The variable must also be mutable.

Your task is to:
1. Create a mutable reference `r` to `s`.
2. Use `r` to push " world" to the string.
*/

fn main() {
    let mut s = String::from("hello");

    // TODO: Create mutable reference `r`
    // let r = ...;

    // TODO: Use `r` to push " world"
    // r.push_str(" world");

    println!("s is {}", s);
    assert_eq!(s, "hello world");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
