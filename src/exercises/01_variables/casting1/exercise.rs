fn main() {
    let x = 3.9;
    let y = 5;

    // TODO: Cast `x` to i32 using `as`
    let sum = x + y;

    println!("Sum is {}", sum);
    assert_eq!(sum, 8); // 3.9 as i32 becomes 3 (truncates)
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}