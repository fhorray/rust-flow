// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Strings - Formatting

Description:
The `format!` macro allows you to create strings using format syntax (like `println!`).
It does not take ownership of its arguments.

Your task is to create a string "Tic-Tac-Toe" using `format!` and the variables provided.
*/

fn main() {
    let s1 = "Tic";
    let s2 = "Tac";
    let s3 = "Toe";

    // TODO: Use format!
    // let s = format!(...);
    let s = String::new();

    println!("{}", s);
    assert_eq!(s, "Tic-Tac-Toe");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
