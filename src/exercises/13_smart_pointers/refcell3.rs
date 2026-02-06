// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Smart Pointers - Combining Rc and RefCell

Description:
A common pattern in Rust is `Rc<RefCell<T>>`.
This allows multiple owners (`Rc`) to mutate the data (`RefCell`).

Your task is to fix the `add_one` function to increment the value inside the `Rc<RefCell<i32>>`.
*/

use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    let value = Rc::new(RefCell::new(5));

    let a = Rc::clone(&value);
    let b = Rc::clone(&value);

    add_one(&a);
    add_one(&b);

    println!("Value: {:?}", value);
    assert_eq!(*value.borrow(), 7);
}

// TODO: Fix this function
fn add_one(value: &Rc<RefCell<i32>>) {
    // value += 1; // Error
    // *value.borrow_mut() += 1;
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
