// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Error Handling Quiz

Description:
Write a function `safe_divide` that returns a custom error `MathError` (enum).
Variants: `DivisionByZero`, `NonPositiveInput`.
*/

#[derive(Debug, PartialEq)]
enum MathError {
    DivisionByZero,
    NonPositiveInput,
}

// TODO: Implement safe_divide
fn safe_divide(dividend: i32, divisor: i32) -> Result<i32, MathError> {
    if divisor == 0 {
        // Return error
        Ok(0) // Fix
    } else if dividend < 0 || divisor < 0 {
        // Return error
        Ok(0) // Fix
    } else {
        Ok(dividend / divisor)
    }
}

fn main() {
    assert_eq!(safe_divide(10, 2), Ok(5));
    assert_eq!(safe_divide(10, 0), Err(MathError::DivisionByZero));
    assert_eq!(safe_divide(-10, 2), Err(MathError::NonPositiveInput));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
