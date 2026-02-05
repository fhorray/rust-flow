// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Ownership - Move Semantics

Description:
In Rust, every value has a single owner. This is the core of Rust's memory management.
When you assign a heap-allocated value (like `String`) to another variable, ownership is "moved".
The original variable becomes invalid and cannot be used anymore. This prevents double-free errors.

The code below attempts to use `s1` after its ownership has been moved to `s2`.

Your task is to fix the `println!` statement to use the current owner of the string value.

Hints:
1. `s1` is no longer valid. `s2` now owns the data.
*/

fn main() {
    let s1 = String::from("hello");
    let s2 = s1;

    // TODO: Fix this usage to print the string via its new owner
    println!("{}, world!", s1);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
