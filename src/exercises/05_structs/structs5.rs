// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Structs - Update Syntax

Description:
You can create a new instance of a struct by using values from another instance.
The `..` syntax specifies that the remaining fields should have the same value as the given instance.

Your task is to create `new_color` which has `red` set to 0, but keeps `green` and `blue` from `old_color`.
*/

#[derive(Debug, PartialEq)]
struct Color {
    red: i32,
    green: i32,
    blue: i32,
}

fn main() {
    let old_color = Color {
        red: 255,
        green: 100,
        blue: 50,
    };

    // TODO: Create new_color using struct update syntax
    let new_color = Color {
        red: 0,
        // ..old_color
        green: 0, // Remove this line
        blue: 0,  // Remove this line
    };

    println!("New color: {:?}", new_color);

    // We expect green=100, blue=50
    assert_eq!(new_color.green, 100);
    assert_eq!(new_color.blue, 50);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
