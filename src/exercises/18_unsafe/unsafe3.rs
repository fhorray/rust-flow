// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Unsafe Rust - Creating Safe Abstractions

Description:
Usually we wrap unsafe code in a safe function (API).
`split_at_mut` is an example.

Your task is to use `std::slice::from_raw_parts_mut` (which is unsafe) to implement `split_at_mut`.
*/

use std::slice;

fn split_at_mut(values: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = values.len();
    let ptr = values.as_mut_ptr();

    assert!(mid <= len);

    // TODO: Use unsafe block to create two slices from raw parts
    // unsafe {
    //     (
    //         slice::from_raw_parts_mut(ptr, mid),
    //         slice::from_raw_parts_mut(ptr.add(mid), len - mid),
    //     )
    // }
    panic!("Not implemented");
}

fn main() {
    let mut v = vec![1, 2, 3, 4, 5, 6];
    let r = &mut v[..];
    // let (a, b) = split_at_mut(r, 3);

    // assert_eq!(a, &mut [1, 2, 3]);
    // assert_eq!(b, &mut [4, 5, 6]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main();
    }
}
