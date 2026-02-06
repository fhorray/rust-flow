// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Traits - Default

Description:
`Default` allows creating a type with a default value.

Your task is to implement `Default` for `Canvas`.
Width and height should default to 100.
*/

#[derive(Debug, PartialEq)]
struct Canvas {
    width: i32,
    height: i32,
}

// TODO: Implement Default
// impl Default for Canvas { ... }

fn main() {
    // let c = Canvas::default();
    // assert_eq!(c.width, 100);
    // assert_eq!(c.height, 100);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
