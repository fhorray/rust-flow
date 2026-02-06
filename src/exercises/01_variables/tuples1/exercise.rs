fn main() {
    // TODO: Create the tuple `t` with the expected values
    let t = (0, 0.0, "");

    // TODO: Access the second element
    let second = t.0; // Currently accessing the first element (wrong type too potentially if logic changes)

    println!("The second element is {}", second);

    assert_eq!(t.0, 500);
    assert_eq!(t.1, 6.4);
    assert_eq!(t.2, "Hello");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}