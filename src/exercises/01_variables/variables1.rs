// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Variables - Declaration

Description:
Rust is a statically typed language, ensuring type safety at compile time.
However, it also supports type inference, so you often don't need to specify types explicitly.
A fundamental rule in Rust is that every variable must be declared before it can be used.

To declare a variable, we use the `let` keyword.
Example:
    let my_variable = 100;

The code below attempts to assign the value `5` to `x`, but `x` has not been introduced to the compiler properly.

Your task is to properly declare `x` using the `let` keyword so that the program can store the value `5` and print it.

Hints:
1. Use `let` followed by the variable name.
2. Ensure the variable is initialized with the value `5`.
*/

fn main() {
    // TODO: Declare the variable `x` properly
    x = 5;
    println!("x is {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_variable_is_declared() {
        // Since we cannot inspect `x` from main directly without modifying main to return it,
        // checking compilation via `main()` execution is the standard way for this level.
        super::main();
    }
}
