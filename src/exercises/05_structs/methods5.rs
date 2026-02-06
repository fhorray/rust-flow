// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Methods - Constructors

Description:
You can have multiple associated functions as constructors.
Your task is to implement `square` which creates a square `Rectangle` (width == height).
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

    // TODO: Implement `square`
    // fn square(size: u32) -> Rectangle { ... }
}

fn main() {
    // let sq = Rectangle::square(10);
    // assert_eq!(sq.width, 10);
    // assert_eq!(sq.height, 10);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
