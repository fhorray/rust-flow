// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Smart Pointers - Rc (Reference Counting)

Description:
`Rc` enables multiple ownership. It keeps track of the number of references to a value.
When the count reaches 0, the value is dropped.
It is only for single-threaded scenarios.

Your task is to use `Rc` to allow `b` and `c` to share ownership of `a`.
*/

use std::rc::Rc;

enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use List::{Cons, Nil};

fn main() {
    // 5 -> 10 -> Nil
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));

    // 3 -> (a)
    // TODO: Use Rc::clone(&a) instead of moving a
    let b = Cons(3, a); // Moves a

    // 4 -> (a)
    let c = Cons(4, a); // Error: use of moved value

    println!("Success!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
