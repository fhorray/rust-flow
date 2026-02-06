// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Advanced Traits - Associated Types

Description:
Traits can define associated types using `type Name;`.
This is used in the `Iterator` trait (`type Item`).

Your task is to implement `Iterator` for `Counter` which yields 1, 2, 3, 4, 5 then None.
*/

struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}

// TODO: Implement Iterator
impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // Implement logic: increment count, if < 6 return Some(count), else None
        None // Fix this
    }
}

fn main() {
    let mut counter = Counter::new();
    assert_eq!(counter.next(), Some(1));
    assert_eq!(counter.next(), Some(2));
    assert_eq!(counter.next(), Some(3));
    assert_eq!(counter.next(), Some(4));
    assert_eq!(counter.next(), Some(5));
    assert_eq!(counter.next(), None);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
