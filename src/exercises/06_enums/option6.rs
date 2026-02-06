// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Option - Return Types

Description:
Functions should return `Option` when they might fail to return a valid value.

Your task is to implement `first_element` which returns the first element of an array if it's not empty, or `None`.
*/

fn main() {
    let a = [10, 20, 30];
    let b: [i32; 0] = [];

    assert_eq!(first_element(&a), Some(10));
    assert_eq!(first_element(&b), None);
}

// TODO: Implement this function
fn first_element(array: &[i32]) -> Option<i32> {
    if array.len() > 0 {
        // Return Some(...)
        None // Fix this
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
