// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Ownership - Clone

Description:
Sometimes you *do* want two variables to have their own copies of the same data.
Since `String` stores data on the heap, copying it is expensive (it requires allocation), so Rust doesn't do it implicitly.
To force a deep copy of the heap data, you can use the `.clone()` method.

The code below fails because `s1` is moved to `s2`. We want `s1` to remain valid.

Your task is to use `.clone()` to assign a copy of `s1` to `s2`, so that both variables are valid independently.

Hints:
1. `let s2 = s1.clone();`
*/

fn main() {
    let s1 = String::from("hello");

    // TODO: Use .clone() here to create a copy instead of moving
    let s2 = s1;

    println!("s1 = {}, s2 = {}", s1, s2);
    // Since we want both to be valid:
    assert_eq!(s1, "hello");
    assert_eq!(s2, "hello");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
