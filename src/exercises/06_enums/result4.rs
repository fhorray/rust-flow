// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Result - Returning Result

Description:
Functions that can fail should return `Result`.

Your task is to implement `divide` which returns `Result<i32, String>`.
If dividing by zero, return `Err("Division by zero".to_string())`.
Otherwise return `Ok(a / b)`.
*/

fn main() {
    assert_eq!(divide(10, 2), Ok(5));
    assert_eq!(divide(10, 0), Err("Division by zero".to_string()));
}

// TODO: Implement divide
fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        // Return Err
        Ok(0) // Fix this
    } else {
        Ok(a / b)
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
