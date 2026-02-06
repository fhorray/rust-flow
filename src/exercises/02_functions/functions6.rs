// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Functions - Explicit Return

Description:
You can use the `return` keyword to return a value from a function, just like in other languages.
This is not idiomatic in Rust for the last expression, but it is valid.

Your task is to fix the function `add` so it returns the sum of `a` and `b`.
Use the `return` keyword for this exercise.
*/

fn main() {
    let result = add(10, 5);
    println!("10 + 5 = {}", result);
    assert_eq!(result, 15);
}

// TODO: Fix this function to return the sum
fn add(a: i32, b: i32) -> i32 {
    a + b; // This is a statement because of the semicolon, so it returns ()
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
