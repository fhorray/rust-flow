// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Control Flow

Description:
Welcome to the module on Control Flow!
In Rust, conditions in `if` statements must be boolean expressions.

The code below has a broken condition. Fix it so that `result` becomes `true`.

Hints:
1. Read the error message carefully.
2. Think about when `x < 100` would be true.
*/

fn main() {
    let x = 1;

    // TODO: Fix this condition so result becomes true
    let result = if x > 100 { true } else { false };

    assert!(result, "The condition should evaluate to true!");
    println!("Success!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
