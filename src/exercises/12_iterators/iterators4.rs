// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Iterators - Custom Iterator

Description:
You can implement the `Iterator` trait for your own types.
You just need to define `type Item` and implement `next`.

Your task is to implement a counter that counts from 1 to 5.
*/

struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // TODO: Implement logic
        // self.count += 1;
        // if self.count < 6 { Some(self.count) } else { None }
        None
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
