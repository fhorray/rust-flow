// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Testing - Assertions

Description:
Tests are special functions annotated with `#[test]` that verify your code behaves as expected.
The `assert!` macro checks that a boolean expression is `true`. If it is `false`, the test panics and fails.

Your task is to fix the assertion in the test function so that it passes.

Hints:
1. Make the condition inside `assert!(...)` evaluate to true.
*/

#[cfg(test)]
mod tests {
    #[test]
    fn you_can_assert() {
        // TODO: Fix the assertion to make the test pass
        assert!(1 == 2);
    }
}
