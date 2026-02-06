// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Smart Pointers - Cow (Clone on Write)

Description:
`Cow` is a smart pointer that holds either a reference (borrowed) or an owned value.
It clones the data lazily only when you need to mutate it.

Your task is to observe when cloning happens.
The `abs_all` function takes a slice of integers.
If all are positive, it returns `Cow::Borrowed`.
If any are negative, it creates a new Vec with absolute values and returns `Cow::Owned`.

Implement `abs_all`.
*/

use std::borrow::Cow;

fn abs_all(input: &[i32]) -> Cow<[i32]> {
    // TODO: Implement the logic
    // For now, always return Borrowed
    Cow::Borrowed(input)
}

fn main() {
    let s1 = [1, 2, 3];
    let r1 = abs_all(&s1);

    let s2 = [1, -2, 3];
    let r2 = abs_all(&s2);

    match r1 {
        Cow::Borrowed(_) => println!("r1 is borrowed"),
        Cow::Owned(_) => println!("r1 is owned"),
    }

    match r2 {
        Cow::Borrowed(_) => println!("r2 is borrowed"),
        Cow::Owned(_) => println!("r2 is owned"),
    }

    // Test assertion
    // assert!(matches!(r1, Cow::Borrowed(_)));
    // assert!(matches!(r2, Cow::Owned(_))); // This fails currently
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
