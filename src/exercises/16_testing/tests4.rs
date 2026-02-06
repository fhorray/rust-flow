// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Testing - Should Panic

Description:
Sometimes expected behavior is a panic (e.g., when inputs are invalid).
You can annotate a test with `#[should_panic]` to assert that it panics.

Your task is to add `#[should_panic]` to the test.
*/

pub fn divide(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("Divide by zero");
    }
    a / b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    // TODO: Add should_panic attribute
    fn test_divide_by_zero() {
        divide(10, 0);
    }
}
