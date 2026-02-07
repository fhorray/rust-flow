// TODO: Fix the constant declaration by adding a type
const NUMBER = 3;

fn main() {
    println!("Number is {}", NUMBER);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_constant_is_correct() {
        super::main();
        assert_eq!(super::NUMBER, 3, "The constant NUMBER should evaluate to 3");
    }
}