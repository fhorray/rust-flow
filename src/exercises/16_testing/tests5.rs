// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Testing - Expected Panic Message

Description:
You can specify the expected panic message to be more precise.
`#[should_panic(expected = "message")]`

Your task is to update the test to expect the message "Divide by zero".
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
    // TODO: Add expected message to should_panic
    #[should_panic]
    fn test_divide_by_zero() {
        divide(10, 0);
    }
}
