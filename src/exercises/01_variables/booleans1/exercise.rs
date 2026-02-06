fn main() {
    // TODO: Set to true
    let is_morning = false;

    // TODO: Set to false
    let is_evening = true;

    if is_morning {
        println!("Good morning!");
    }

    if is_evening {
        println!("Good evening!");
    }

    assert!(is_morning);
    assert!(!is_evening);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}