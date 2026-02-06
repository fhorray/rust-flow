// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Unsafe Quiz

Description:
Implement a function `get_value_at_index` that takes a raw pointer to an array and an index, and returns the value.
Assume valid pointer and index.
*/

fn get_value_at_index(ptr: *const i32, index: usize) -> i32 {
    // TODO: Implement using unsafe pointer arithmetic and dereferencing
    // unsafe { ... }
    0
}

fn main() {
    let arr = [10, 20, 30];
    let ptr = arr.as_ptr();

    assert_eq!(get_value_at_index(ptr, 1), 20);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
