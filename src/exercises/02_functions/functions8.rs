// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Functions - Expressions vs Statements

Description:
In Rust, assignments like `let x = ...` are statements and do not return a value.
Expressions do return a value.
You cannot write `let x = (let y = 5);`.

The code below tries to bind the result of a block to `x`.
However, the block ends with a semicolon, turning the last expression into a statement.

Your task is to fix the code so `x` gets the value `5` (type `i32`), not `()` (unit type).
*/

fn main() {
    // TODO: Fix this assignment so x is 5
    let x = {
        let y = 5;
        y; // This semicolon makes the block evaluate to ()
    };

    println!("x is {:?}", x);

    assert_eq!(x, 5);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
