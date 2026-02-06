// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Testing Quiz

Description:
Write a test module.
1. Test `is_positive` with a positive number.
2. Test `is_positive` with a negative number.
3. Test `panic_if_zero` ensuring it panics on 0.
*/

pub fn is_positive(n: i32) -> bool {
    n > 0
}

pub fn panic_if_zero(n: i32) {
    if n == 0 {
        panic!("Zero!");
    }
}

// TODO: Write tests module

#[cfg(test)]
mod tests {
    // use super::*;
    // ...
}
