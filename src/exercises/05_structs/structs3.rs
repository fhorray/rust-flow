// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Structs - Mutability

Description:
Structs are immutable by default. To modify any field, the entire struct instance must be mutable.
Rust does not allow only some fields to be mutable.

Your task is to:
1. Make `my_color` mutable.
2. Change the `green` field to 255.
*/

struct Color {
    red: i32,
    green: i32,
    blue: i32,
}

fn main() {
    let my_color = Color {
        red: 100,
        green: 100,
        blue: 100,
    };

    // TODO: Change green to 255
    // my_color.green = 255; // This will fail until you fix the declaration

    println!("New green: {}", my_color.green);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
