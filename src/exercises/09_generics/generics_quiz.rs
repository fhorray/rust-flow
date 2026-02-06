// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Generics Quiz

Description:
Build a `Container` struct that holds a value of type `T`.
Implement `new` and `inner`.
Only allow `T` that implements `PartialEq`.
Implement a method `contains` that checks if the inner value equals another value.
*/

struct Container<T> {
    value: T,
}

impl<T> Container<T> {
    fn new(value: T) -> Self {
        Container { value }
    }
}

// TODO: Implement `contains` for T: PartialEq
impl<T: PartialEq> Container<T> {
    fn contains(&self, other: &T) -> bool {
        false // Fix this
    }
}

fn main() {
    let c = Container::new(10);
    assert!(c.contains(&10));
    assert!(!c.contains(&20));
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
