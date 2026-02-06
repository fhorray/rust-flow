// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - Mismatched Types

Description:
When using `if` as an expression, both the `if` block and the `else` block must return the same type.
The code below tries to return an integer in one branch and a string in another.

Your task is to fix the code so both arms return an integer (e.g., return `0` instead of "zero").
*/

fn main() {
    let result = foo_if_fizz("fizz");
    println!("Result: {}", result);
}

fn foo_if_fizz(fizzish: &str) -> i32 {
    if fizzish == "fizz" {
        1
    } else {
        // TODO: Fix this arm to return an i32
        "zero"
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
