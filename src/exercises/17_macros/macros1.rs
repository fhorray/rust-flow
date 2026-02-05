// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Macros - Definition

Description:
Macros allow you to write code that writes other code (metaprogramming).
They are expanded at compile time.
Declarative macros are defined using the `macro_rules!` construct.
They look like `match` expressions, where patterns are matched against the input code.

Your task is to define a macro named `my_macro` that prints "Hello, Macro!" when called.

Hints:
1. Syntax:
   macro_rules! name {
       () => { ... };
   }
*/

// TODO: Define my_macro
// macro_rules! ...

fn main() {
    // Uncomment this line to test your macro
    // my_macro!();
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
