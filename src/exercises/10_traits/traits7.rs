// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Traits - Where Clauses

Description:
Using `where` clauses makes complex bounds readable.

Your task is to:
1. Rewrite the bounds using `where`.
2. Add `Display` bound to `T` so the code compiles.
*/

use std::fmt::Display;

trait Animal {
    fn sound(&self) -> String;
}

// TODO: Rewrite using where and add Display to T
fn some_func<T: Animal + Clone, U: Animal + Display>(t: &T, u: &U) {
    println!("t: {}", t); // Error: T is not Display
}

fn main() {
    // Placeholder
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
