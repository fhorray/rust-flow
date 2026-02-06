// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Methods - Mutable Methods

Description:
If a method needs to modify the struct instance, it must take `&mut self`.

Your task is to implement the `grow` method which doubles the width and height of the rectangle.
*/

#[derive(Debug, PartialEq)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // TODO: Implement `grow` method
    // fn grow(...) { ... }
}

fn main() {
    let mut rect = Rectangle { width: 10, height: 10 };

    // rect.grow();

    println!("Rect: {:?}", rect);
    // assert_eq!(rect.width, 20);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
