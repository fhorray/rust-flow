// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Macros

Description:
⭐⭐⭐⭐ - Understanding hygiene
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
