fn main() {
    let t = ((1, 2), (3, 4), 5);

    // TODO: Access the integer `5`
    let val = 0;

    println!("Value is {}", val);

    assert_eq!(val, 5);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}