fn main() {
    // TODO: Define x as 100
    let x = 0;

    // TODO: Define y as 255 using hex
    let y = 0x00;

    println!("x: {}, y: {}", x, y);

    assert_eq!(x, 100);
    assert_eq!(y, 255);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}