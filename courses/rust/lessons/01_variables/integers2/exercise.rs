fn main() {
    // TODO: Change the type of `x` to avoid overflow
    let x: u8 = 300;
    println!("x is {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}