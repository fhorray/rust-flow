// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Traits - Deref

Description:
`Deref` allows treating a type like a reference to another type.

Your task is to implement `Deref` for `MyBox` so we can access inner methods of `T`.
*/

use std::ops::Deref;

struct MyBox<T> {
    value: T,
}

impl<T> MyBox<T> {
    fn new(value: T) -> MyBox<T> {
        MyBox { value }
    }
}

// TODO: Implement Deref
// impl<T> Deref for MyBox<T> { ... }

fn main() {
    let x = MyBox::new(String::from("Rust"));
    // println!("Length: {}", x.len()); // This works because of Deref coercion
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
