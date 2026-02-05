// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Structs - Definition

Description:
Structs (short for structures) are custom data types that let you name and package together multiple related values.
They are similar to classes in object-oriented languages, but they contain only data, not methods (methods are defined separately).

Your task is to define a struct named `Color` with three fields:
- `red` of type `i32`
- `green` of type `i32`
- `blue` of type `i32`

Hints:
1. Syntax:
   struct Name {
       field: Type,
       ...
   }
*/

// TODO: Define the struct Color properly
struct Color {
    red: i32,
    // Add other fields
}

fn main() {
    let green = Color {
        red: 0,
        green: 255,
        blue: 0,
    };

    println!("Green: {}, {}, {}", green.red, green.green, green.blue);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_color_struct() {
        let c = Color {
            red: 10,
            green: 20,
            blue: 30,
        };
        assert_eq!(c.red, 10);
        assert_eq!(c.green, 20);
        assert_eq!(c.blue, 30);
    }
}
