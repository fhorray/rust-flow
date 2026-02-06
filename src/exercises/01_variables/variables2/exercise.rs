fn main() {
    let x = 10;
    println!("x is {}", x);

    // TODO: Make `x` mutable so this assignment works
    x = 20;
    println!("x is now {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}