// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Iterators Quiz

Description:
Implement `factorial` using iterators.
Do not use a `for` loop or recursion.
*/

fn factorial(n: u64) -> u64 {
    // TODO: Use range and product/fold
    if n == 0 { return 1; }
    0
}

fn main() {
    assert_eq!(factorial(0), 1);
    assert_eq!(factorial(1), 1);
    assert_eq!(factorial(5), 120);
    println!("Success!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
