// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Enums - Variants with Data

Description:
Rust enums are powerful because each variant can optionally hold data.
This means you can encode different types of information in a single enum type.
- `Quit`: no data associated.
- `Echo`: holds a `String`.
- `Move`: holds an anonymous struct with fields `x` and `y` (both integers).
- `ChangeColor`: holds a tuple of three integers (r, g, b).

Your task is to define the `Message` enum variants to hold this data.

Hints:
1. Syntax for tuple variant: `Name(Type, Type)`
2. Syntax for struct variant: `Name { field: Type, ... }`
*/

#[derive(Debug)]
enum Message {
    // TODO: Define the variants with their expected data types
    Quit,
    Echo,
    Move,
    ChangeColor,
}

fn main() {
    let m1 = Message::Quit;
    let m2 = Message::Echo(String::from("Hello"));
    let m3 = Message::Move { x: 10, y: 20 };
    let m4 = Message::ChangeColor(255, 0, 0);

    println!("{:?}", m1);
    println!("{:?}", m2);
    println!("{:?}", m3);
    println!("{:?}", m4);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_echo() {
        if let Message::Echo(s) = Message::Echo(String::from("test")) {
            assert_eq!(s, "test");
        } else {
            panic!("Echo did not match");
        }
    }

    #[test]
    fn test_move() {
        if let Message::Move { x, y } = (Message::Move { x: 1, y: 2 }) {
            assert_eq!(x, 1);
            assert_eq!(y, 2);
        } else {
            panic!("Move did not match");
        }
    }
}
