// TODO: Define the constant MAX_POINTS
// const MAX_POINTS: u32 = ...;

fn main() {
    println!("Max points: {}", MAX_POINTS);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}