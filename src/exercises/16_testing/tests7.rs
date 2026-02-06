// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Testing - Integration Tests

Description:
Integration tests usually live in `tests/` directory, but we can simulate them here.
They treat the crate as a library.

Your task is to write a test that calls `add`.
*/

pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        // TODO: assert eq add(2, 3) == 5
    }
}
