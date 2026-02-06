fn main() {
    // TODO: Define my_char as the crab emoji
    let my_char = ' ';

    println!("Reviewer: I love {}", my_char);
    assert_eq!(my_char, '🦀');
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}