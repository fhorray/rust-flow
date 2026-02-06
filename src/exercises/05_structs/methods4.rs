// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Methods - Associated Functions

Description:
Associated functions are defined in an `impl` block but don't take `self`.
They are often used as constructors (like `new`).

Your task is to implement `new` which creates a `Rectangle`.
*/

#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // TODO: Implement `new`
    // fn new(width: u32, height: u32) -> Rectangle { ... }
}

fn main() {
    // let rect = Rectangle::new(30, 50);
    // println!("Rect: {:?}", rect);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
