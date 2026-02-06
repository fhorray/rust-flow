fn main() {
    let a = 0.1;
    let b = 0.2;
    let c = 0.3;

    // TODO: Fix this comparison
    if (a + b) == c {
        println!("Equal!");
    } else {
        println!("Not equal!");
        panic!("They should be (approximately) equal!");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}