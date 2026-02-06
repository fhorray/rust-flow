fn main() {
    // TODO: Define x as f64
    let x: f64 = 0.0;

    // TODO: Define y as f32
    let y: f32 = 0.0;

    println!("x: {}, y: {}", x, y);

    assert_eq!(x, 3.14);
    assert_eq!(y, 3.14);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}