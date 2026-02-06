fn main() {
    // TODO: Define the array `a` with numbers 1 to 5
    let a: [i32; 5]; // Placeholder with wrong values

    println!("The second element is {}", a[1]);

    // Check results
    assert_eq!(a.len(), 5, "Array length must be 5");
    assert_eq!(a[0], 1, "First element should be 1");
    assert_eq!(a[4], 5, "Last element should be 5");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_array_content() {
        // We can't easily access main's variables, but main contains assertions.
        super::main();
    }
}