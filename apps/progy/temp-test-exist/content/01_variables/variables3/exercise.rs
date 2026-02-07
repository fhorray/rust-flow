fn main() {
    let x = 10;
    {
        println!("Inner x is {}", x);
    }
    // TODO: Fix the scope of `x` so it can be printed here
    println!("Outer x is {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}