// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Methods - Parameters

Description:
Methods can take additional parameters besides `self`.

Your task is to implement `can_hold` which returns true if this rectangle can completely hold another rectangle inside it.
(i.e., this width > other width AND this height > other height).
*/

struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    // TODO: Implement `can_hold`
    // fn can_hold(&self, other: &Rectangle) -> bool { ... }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 10, height: 20 };

    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));

    // assert!(rect1.can_hold(&rect2));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
