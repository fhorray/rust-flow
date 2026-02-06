// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Enums - While Let

Description:
`while let` allows you to loop as long as a pattern matches.
This is commonly used with iterators or popping from a collection.

Your task is to use `while let` to pop items from `stack` until it returns `None`.
Print each popped value.
*/

fn main() {
    let mut stack = vec![1, 2, 3, 4, 5];

    // TODO: Use while let to pop from stack
    // while let Some(x) = stack.pop() {
    //    println!("{}", x);
    // }

    // Check stack is empty
    assert!(stack.is_empty());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
