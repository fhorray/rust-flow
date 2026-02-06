// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Smart Pointers - Recursive Types

Description:
Rust needs to know the size of a type at compile time.
Recursive types (like a linked list node that contains another node) have infinite size if stored directly.
Wrapping the recursive field in a `Box` breaks the cycle because `Box` has a fixed size (pointer size).

Your task is to fix the `List` enum by wrapping the recursive variant in a Box.
*/

#[derive(Debug)]
enum List {
    Cons(i32, List), // Error: infinite size
    Nil,
}

fn main() {
    use List::{Cons, Nil};

    // let list = Cons(1, Box::new(Cons(2, Box::new(Nil))));
    // println!("{:?}", list);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
