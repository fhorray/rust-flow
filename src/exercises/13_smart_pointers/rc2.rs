// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Smart Pointers - Rc Reference Count

Description:
You can check the reference count using `Rc::strong_count`.

Your task is to verify how the count changes when we clone.
*/

use std::rc::Rc;

fn main() {
    let five = Rc::new(5);

    println!("Count after creation: {}", Rc::strong_count(&five));
    assert_eq!(Rc::strong_count(&five), 1);

    let _share1 = Rc::clone(&five);
    println!("Count after share1: {}", Rc::strong_count(&five));

    // TODO: Fix the assertion
    assert_eq!(Rc::strong_count(&five), 1); // Should be 2

    {
        let _share2 = Rc::clone(&five);
        println!("Count after share2: {}", Rc::strong_count(&five));
        // TODO: Assert count is 3
    }

    println!("Count after share2 drops: {}", Rc::strong_count(&five));
    // TODO: Assert count is 2
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
