// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Iterators - Basics

Description:
Iterators provide a way to process a sequence of elements.
In Rust, the `Iterator` trait requires a method `next`, which returns an `Option<Item>`.
- `Some(value)` when there is a value.
- `None` when the iteration is finished.

You can create an iterator from a vector using `.iter()`.
Note that iterators are lazy: they don't do anything until you call methods to consume them.
Also, the iterator itself needs to be `mut` because calling `next()` changes its internal state.

Your task is to:
1. Create a mutable iterator `iter` from the vector `v`.
2. Use `.next()` to retrieve the first value (which should be 1).
*/

fn main() {
    let v = vec![1, 2, 3];

    // TODO: Create a mutable iterator from v
    let mut iter = ""; // Fix this - should be v.iter()

    // TODO: Get the first item using .next()
    let item = ""; // Fix this - should call iter.next()

    println!("First item: {:?}", item);
    assert_eq!(item, Some(&1));
    assert_eq!(item, Some(&1));
}

// ???: Why does the iterator variable need to be mutable (`mut`)?
// (Hint: What happens to the internal state of the iterator when you call `next()`?)

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
