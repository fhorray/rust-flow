// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Methods - Definition

Description:
Methods are functions that are defined within the context of a struct (using an `impl` block).
Their first parameter is always `self`, which represents the instance of the struct the method is being called on.
- `&self` borrows the instance immutably.
- `&mut self` borrows the instance mutably.
- `self` takes ownership of the instance.

Your task is to implement the `area` method for the `Rectangle` struct.
It should return the area (width * height) as a `u32`.

Hints:
1. `impl Rectangle { ... }`
2. `fn area(&self) -> u32 { ... }`
*/

struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // TODO: Implement `area` method
}

fn main() {
    let rect = Rectangle { width: 30, height: 50 };

    // Uncomment this line to check your work
    // println!(
    //     "The area of the rectangle is {} square pixels.",
    //     rect.area()
    // );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_area() {
        let rect = Rectangle { width: 10, height: 20 };
        // This test will fail to compile until `area` is implemented
        assert_eq!(rect.area(), 200);
    }
}
