// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Unsafe Rust - Static Mutable Variables

Description:
Global variables (static) can be mutable, but accessing them is unsafe because of potential data races.

Your task is to read and write to `COUNTER`.
*/

static mut COUNTER: u32 = 0;

fn add_to_count(inc: u32) {
    // TODO: Modify COUNTER inside unsafe
    // unsafe {
    //     COUNTER += inc;
    // }
}

fn main() {
    add_to_count(3);

    // TODO: Read COUNTER inside unsafe
    // unsafe {
    //     println!("COUNTER: {}", COUNTER);
    // }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
