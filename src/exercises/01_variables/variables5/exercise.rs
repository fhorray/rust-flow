fn main() {
    let x = "5";
    println!("x is a string: {}", x);

    // TODO: Use shadowing to convert the string `x` into an integer `x`
    x = x.parse::<i32>().unwrap();

    println!("x is now a number: {}", x + 5);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}