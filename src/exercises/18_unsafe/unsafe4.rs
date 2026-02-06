// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Unsafe Rust - FFI (Foreign Function Interface)

Description:
You can call C functions from Rust using `extern "C"`.
This is always unsafe.

Your task is to call the C function `abs` (absolute value).
*/

unsafe extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    // TODO: Call abs(-3) inside unsafe block
    // unsafe {
    //     println!("Absolute value of -3 according to C: {}", abs(-3));
    // }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
