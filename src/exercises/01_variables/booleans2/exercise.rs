fn main() {
    let t = false;
    let f = true; // wait, this name is confusing if it's meant to be false?
    // Let's use simpler names

    // TODO: Change these values so the final expression is true
    let a = false;
    let b = false;

    // Expression: (a OR b) AND (NOT b)
    // We want this to be true.
    let is_rust_fun = (a || b) && !b;

    println!("Is Rust fun? {}", is_rust_fun);
    assert!(is_rust_fun);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}