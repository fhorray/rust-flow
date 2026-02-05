// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Structs - Instantiation

Description:
To use a struct, you create an "instance" of it by specifying concrete values for each field.
You access fields using dot notation (e.g., `instance.field`).

Your task is to:
1. Create an instance of the `Color` struct named `red`.
2. Set its values to: red=255, green=0, blue=0.
3. Print the red component.

Hints:
1. Syntax: `let instance = StructName { field: value, ... };`
*/

struct Color {
    red: i32,
    green: i32,
    blue: i32,
}

fn main() {
    // TODO: Create an instance named `red`
    // let red = ...;

    // Uncomment and fix if needed:
    // println!("Red component is {}", red.red);

    // assert_eq!(red.red, 255);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
