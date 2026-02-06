fn main() {
    let t = (1, 2, 3);

    // TODO: Destructure `t` into `x`, `y`, `z`
    let (x, y, z) = (0, 0, 0);

    println!("x: {}, y: {}, z: {}", x, y, z);

    assert_eq!(x, 1);
    assert_eq!(y, 2);
    assert_eq!(z, 3);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}