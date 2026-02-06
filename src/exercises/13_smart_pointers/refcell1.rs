// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Smart Pointers - RefCell

Description:
`RefCell` allows "interior mutability".
It enforces borrowing rules at runtime instead of compile time.
This allows you to mutate data even when you have an immutable reference to the `RefCell`.

Your task is to borrow the value mutably and change it to 20.
*/

use std::cell::RefCell;

fn main() {
    let x = RefCell::new(10);

    // TODO: Borrow mutably and update value
    // *x.borrow_mut() += 10;

    println!("x is {:?}", x);
    assert_eq!(*x.borrow(), 20);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
