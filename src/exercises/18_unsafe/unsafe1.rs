// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Unsafe Rust - Dereferencing Raw Pointers

Description:
Rust guarantees memory safety, but sometimes you need to bypass these checks (e.g., when interfacing with C code).
`unsafe` Rust allows you to perform actions that the compiler cannot guarantee are safe, such as dereferencing raw pointers.
Raw pointers (`*const T` and `*mut T`) are like C pointers: they can be null, dangling, or unaligned.
Dereferencing them is considered "unsafe" and must be done inside an `unsafe` block.

Your task is to dereference the raw pointer `r1` to print the value it points to.

Hints:
1. Wrap the dereference `*r1` inside `unsafe { ... }`.
*/

fn main() {
    let mut num = 5;

    let r1 = &num as *const i32;
    let r2 = &mut num as *mut i32;

    // TODO: Dereference r1 inside unsafe block and print the value
    // println!("r1 is: {}", ...);
    // println!("r1 is: {}", ...);
}

// ???: Why does Rust force us to use `unsafe` blocks for certain operations?
// (Think about what guarantees the compiler makes in safe Rust vs unsafe Rust)

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
