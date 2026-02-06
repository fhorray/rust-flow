// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Unsafe Rust - Unsafe Functions

Description:
You can define functions as `unsafe`.
To call them, you must be inside an `unsafe` block.

Your task is to call the `dangerous` function.
*/

unsafe fn dangerous() {}

fn main() {
    // TODO: Call dangerous
    // unsafe {
    //     dangerous();
    // }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
