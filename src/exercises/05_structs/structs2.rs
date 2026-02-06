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
    // TODO: Create an instance named `red` with red=255, green=0, blue=0
    // let red = Color { ... };

    // Assertions will fail until you create the struct
    // (Currently this won't compile because `red` doesn't exist)
    let red = Color {
        red: 0,
        green: 0,
        blue: 0,
    }; // Placeholder - make it (255, 0, 0)

    println!("Red component is {}", red.red);
    assert_eq!(red.red, 255, "The red component should be 255");
    assert_eq!(red.green, 0, "The green component should be 0");
    assert_eq!(red.blue, 0, "The blue component should be 0");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
