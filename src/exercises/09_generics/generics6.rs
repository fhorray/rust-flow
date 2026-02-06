// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Generics - Trait Bounds

Description:
To do something useful with a generic type (like print it), you need to restrict it using trait bounds.

Your task is to restrict `T` to types that implement `Display` so you can print them.
*/

use std::fmt::Display;

fn print_me<T>(item: T) {
    println!("{}", item); // Error: T doesn't implement Display
}

fn main() {
    print_me("Hello");
    print_me(42);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
