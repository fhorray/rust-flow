// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Testing

Description:
⭐ - Write a basic test
*/

fn main() {
    // TODO: Fix this code
    let x = "change me";
    println!("Exercise: {}", x);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
