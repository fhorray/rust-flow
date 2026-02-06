fn main() {
    // TODO: Change this to be a mutable variable
    const X: i32 = 10;

    X = 20;

    println!("X is {}", X);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}