// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Generics - Where Clause

Description:
Use `where` clause for cleaner bounds.

Your task is to rewrite the function signature to use a `where` clause for the `Display` bound.
*/

use std::fmt::Display;

// TODO: Use where clause to fix the error
fn print_me<T>(item: T) {
    println!("{}", item);
}

fn main() {
    print_me("Hello");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
