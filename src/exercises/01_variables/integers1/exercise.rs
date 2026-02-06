fn main() {
    // TODO: Define `x` as u8 with value 255
    let x: u8 = 0;

    // TODO: Define `y` as i8 with value -128
    let y: i8 = 0;

    println!("x: {}, y: {}", x, y);

    assert_eq!(x, 255);
    assert_eq!(y, -128);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}