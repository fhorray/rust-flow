// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Macros - Overloading

Description:
Macros can have multiple branches (patterns).

Your task is to implement `my_macro` to handle:
1. `()` -> prints "Empty"
2. `($e:expr)` -> prints "One: $e"
*/

macro_rules! my_macro {
    // TODO: Add empty branch
    () => {
        println!("Empty");
    };
    // TODO: Add expression branch
    // ...
}

fn main() {
    my_macro!();
    // my_macro!(10);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
