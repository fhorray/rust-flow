// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Option - Map

Description:
`map()` allows you to transform the value inside an `Option` if it exists, without unwrapping it.
If the Option is `None`, `map` returns `None`.

Your task is to use `.map()` to square the value inside `maybe_number`.
*/

fn main() {
    let maybe_number = Some(5);

    // TODO: Use map to square the number
    let squared = maybe_number; // .map(|n| ...);

    println!("Squared: {:?}", squared);
    assert_eq!(squared, Some(25));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
