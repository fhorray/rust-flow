fn main() {
    let a = [10, 20, 30, 40, 50];
    let index = 10;

    // TODO: Use `.get()` instead of direct indexing to handle the error gracefully
    // Hint: `array.get(index)` returns `Some(&value)` or `None`
    // Handle each case with `match` or `if let`
    println!("Value: {}", a[index]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}