// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Result - The ? Operator

Description:
The `?` operator is a shorthand for matching on a Result.
If it's `Ok`, it unwraps the value.
If it's `Err`, it returns the error from the function immediately.

Your task is to rewrite `read_number` using the `?` operator instead of `match`.
*/

use std::num::ParseIntError;

fn main() {
    println!("{:?}", read_number("10"));
    println!("{:?}", read_number("abc"));
}

fn read_number(s: &str) -> Result<i32, ParseIntError> {
    // TODO: Rewrite using `?` to handle the result of parse()
    let num = s.parse::<i32>();

    // If you use `?` above, num will be i32.
    // If not, it is Result<i32, ParseIntError>.
    // The line below expects i32.
    Ok(num)
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
