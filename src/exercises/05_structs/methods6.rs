// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Methods - Chaining

Description:
Methods can return `Self` (owned) to allow method chaining (e.g., `rect.with_width(10).with_height(20)`).
This consumes the original and returns a modified new one.

Your task is to implement `with_width` and `with_height` to allow chaining.
*/

#[derive(Debug, PartialEq)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn new(width: u32, height: u32) -> Rectangle {
        Rectangle { width, height }
    }

    // TODO: Implement `with_width`
    // fn with_width(mut self, width: u32) -> Self { ... }

    // TODO: Implement `with_height`
}

fn main() {
    let rect = Rectangle::new(0, 0)
        // .with_width(10)
        // .with_height(20);
        ; // remove semicolon when uncommenting

    println!("Rect: {:?}", rect);
    // assert_eq!(rect.width, 10);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
