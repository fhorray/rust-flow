// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Strings - Concatenation

Description:
You can concatenate strings using the `+` operator.
Note that `s1 + &s2` takes ownership of `s1`.

Your task is to combine `s1` and `s2` into `s3`.
*/

fn main() {
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");

    // TODO: Concatenate s1 and s2
    // let s3 = ...;

    // println!("{}", s3);
    // assert_eq!(s3, "Hello, world!");

    // Check ownership of s1 (should be invalid)
    // println!("{}", s1); // This should fail if done correctly with +
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
