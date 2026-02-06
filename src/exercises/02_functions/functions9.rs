// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Functions - Block Expressions

Description:
Blocks `{}` in Rust are expressions. They evaluate to the last expression inside them.

Your task is to use a block to calculate `y`.
Inside the block:
1. Declare a temporary variable `x` equal to 3.
2. Return `x + 1` from the block (no semicolon!).
*/

fn main() {
    let y = {
        // TODO: Define x = 3

        // TODO: Return x + 1
        0 // placeholder
    };

    println!("y is {}", y);
    assert_eq!(y, 4);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
