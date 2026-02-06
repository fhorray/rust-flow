// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Testing - Public Functions

Description:
You can test private functions in the same module, but usually integration tests only test public functions.
Here we are testing a function `is_even`.

Your task is to verify `is_even` works correctly.
*/

pub fn is_even(n: i32) -> bool {
    n % 2 == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn is_true_when_even() {
        // TODO: Assert that is_even(4) is true

    }

    #[test]
    fn is_false_when_odd() {
        // TODO: Assert that is_even(3) is false

    }
}
