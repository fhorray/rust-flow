// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Variables - Scope

Description:
Variables in Rust are valid only within the "scope" where they are declared.
A scope usually begins with a curly brace `{` and ends with a closing curly brace `}`.
When a variable goes out of scope, it is dropped and cannot be accessed anymore.

The variable `x` is defined inside an inner block (a new scope), but the code attempts to access it in the outer block.

Your task is to fix the code so that `x` is accessible where it is used in the `println!` statement outside the block.

Hints:
1. You can verify where `x` is declared.
2. Consider declaring `x` before the inner block starts.
*/

fn main() {
    {
        let x = 10;
        println!("Inner x is {}", x);
    }
    // TODO: Fix the scope of `x` so it can be printed here
    println!("Outer x is {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
