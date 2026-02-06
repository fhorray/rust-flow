// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Smart Pointers - RefCell Panic

Description:
`RefCell` tracks borrows at runtime.
If you violate the rules (two mutable borrows, or mutable + immutable), it panics.

Your task is to create a panic by borrowing mutably twice.
Then fix it by dropping the first borrow before the second.
Wait, let's just make the task to *fix* a panicking code.
*/

use std::cell::RefCell;

fn main() {
    let c = RefCell::new(5);

    let mut borrowed_1 = c.borrow_mut();
    // let mut borrowed_2 = c.borrow_mut(); // This panics!

    // TODO: Fix the panic. You can wrap the first borrow in a block scope.

    *borrowed_1 += 1;

    // println!("borrowed_2: {}", borrowed_2);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
