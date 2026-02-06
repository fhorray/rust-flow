fn main() {
    // TODO: Create array `a` with 100 zeros
    let a; // Placeholder

    if a.len() == 100 && a[0] == 0 {
        println!("Success!");
    } else {
        println!("Failed!");
        panic!("Array should have 100 elements initialized to 0");
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}