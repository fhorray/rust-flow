// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Slices - String Slices

Description:
A string slice (`&str`) is a reference to a sequence of bytes in memory (usually part of a `String`).
It allows you to view a portion of the string efficiently without copying the data.
Slices are created using the range syntax `[start..end]`.
- `start` is the starting index (inclusive).
- `end` is the ending index (exclusive).

Your task is to create two slices from the string `s`:
1. `hello` containing "Hello"
2. `world` containing "World"

Hints:
1. "Hello" is at indices 0 to 5 (bytes).
2. "World" starts at index 6.
*/

fn main() {
    let s = String::from("Hello World");

    // TODO: Create the slices using range syntax [start..end]
    let hello = &s[0..0]; // Fix range
    let world = &s[0..0]; // Fix range

    println!("{} {}", hello, world);

    assert_eq!(hello, "Hello");
    assert_eq!(world, "World");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
