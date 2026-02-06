fn main() {
    // TODO: Change this value to something that fits in u8
    let big_n: u16 = 1000;

    let small_n = big_n as u8;

    println!("Original: {}, Casted: {}", big_n, small_n);

    assert_eq!(big_n as u8, small_n);
    // We want no data loss:
    assert_eq!(big_n, small_n as u16);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}