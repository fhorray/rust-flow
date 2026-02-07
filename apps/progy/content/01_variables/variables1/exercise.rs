fn main() {
    // TODO: Declare the variable `x` properly using `let`
    x = 5;
    println!("x is {}", x);
}

// ???: Why do you think Rust requires you to declare variables before using them?
// (Think about type safety and compiler optimization)

#[cfg(test)]
mod tests {
    #[test]
    fn test_variable_is_declared() {
        // Since we cannot inspect `x` from main directly without modifying main to return it,
        // checking compilation via `main()` execution is the standard way for this level.
        super::main();
    }
}
