// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Smart Pointers - Weak

Description:
`Weak` references are non-owning references.
They don't prevent the value from being dropped.
They are useful for breaking reference cycles (e.g., parent <-> child).

Your task is to downgrade a strong `Rc` to a `Weak` reference, then try to upgrade it back.
*/

use std::rc::Rc;

fn main() {
    let strong = Rc::new(5);

    // TODO: Create a weak reference
    // let weak = Rc::downgrade(&strong);

    // Drop the strong reference
    drop(strong);

    // TODO: Try to upgrade
    // match weak.upgrade() {
    //     Some(v) => println!("Value exists: {}", v),
    //     None => println!("Value was dropped"),
    // }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
