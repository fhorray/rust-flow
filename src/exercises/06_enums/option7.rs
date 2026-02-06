// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Option - Chaining

Description:
You can chain multiple Option operations using `and_then`.
This is useful when you have a sequence of operations that each return an Option.

Your task is to chain `checked_div` and `checked_mul` to calculate `(n / d) * m`.
*/

fn main() {
    let n = 100;
    let d = 2;
    let m = 3;

    // Logic: (100 / 2) * 3 = 50 * 3 = 150
    // Use checked_div and checked_mul to be safe against div by zero or overflow

    // TODO: Use and_then to chain the operations
    let result = Some(n)
        .and_then(|x| x.checked_div(d))
        // .and_then(...)
        ; // remove semicolon if extending

    // Wait, checked_div returns Option.

    println!("Result: {:?}", result);
    // assert_eq!(result, Some(150));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
