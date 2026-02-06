// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Ownership Quiz - Functions and References

Description:
This program is a mess of ownership errors.
It tries to modify strings, return references, and use moved values.

Your task is to make it compile and run correctly.
*/

fn main() {
    let mut s1 = String::from("Hello");
    let mut s2 = String::from("World");

    let result = combine(&mut s1, &s2);

    println!("Combined: {}", result);
    println!("Originals: {}, {}", s1, s2);
}

// TODO: This function has issues
fn combine(s1: &mut String, s2: &String) -> &String {
    s1.push_str(" ");
    s1.push_str(s2);

    // We are returning a reference to s1, but the signature says we return &String.
    // However, if we return &s1, we need to make sure lifetimes match.
    // Or maybe we should return a new String?
    // For this quiz, let's say we want to return the reference to the modified s1.
    s1
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
