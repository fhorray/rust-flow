fn main() {
    // TODO: Define c as 'z'
    let c: char = ' ';

    println!("c is {}", c);
    assert_eq!(c, 'z');
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}