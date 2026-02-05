// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Enums - Definition

Description:
Enums (enumerations) allow you to define a type by listing its possible variants.
Unlike structs, which combine multiple fields into one type, enums allow a value to be *one of* several different variants.

Your task is to define an enum named `Message` with four variants:
- `Quit`
- `Echo`
- `Move`
- `ChangeColor`

Hints:
1. Syntax:
   enum Name {
       Variant1,
       Variant2,
       ...
   }
*/

// TODO: Define the enum `Message`
enum Message {
    // Add variants here
}

fn main() {
    let msg1 = Message::Quit;
    let msg2 = Message::Echo;
    let msg3 = Message::Move;
    let msg4 = Message::ChangeColor;

    println!("We have defined the variants successfully!");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_variants() {
        // We can't easily check for existence of variants at runtime without using them.
        // The fact that this compiles with the usage in main is the test.
        let _ = Message::Quit;
        let _ = Message::Echo;
        let _ = Message::Move;
        let _ = Message::ChangeColor;
    }
}
