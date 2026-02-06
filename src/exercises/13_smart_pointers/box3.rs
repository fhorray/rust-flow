// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Smart Pointers - Dereferencing

Description:
You can dereference a Box using `*` just like a reference.
This gives you access to the underlying value.

Your task is to dereference `b` to verify it equals 5.
*/

fn main() {
    let x = 5;
    let b = Box::new(x);

    assert_eq!(5, x);
    // TODO: Fix this assertion
    // assert_eq!(5, b); // Error: can't compare integer with Box
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
