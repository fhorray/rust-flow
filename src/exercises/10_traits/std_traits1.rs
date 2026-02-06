// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Traits - Eq and PartialEq

Description:
`PartialEq` allows comparison with `==` and `!=`.

Your task is to implement `PartialEq` for `Book`.
Two books are equal if their ISBNs are equal.
*/

#[derive(Debug)]
struct Book {
    isbn: i32,
    format: String, // "Paperback" or "Hardcover"
}

// TODO: Implement PartialEq
// impl PartialEq for Book { ... }

fn main() {
    let b1 = Book { isbn: 3, format: "Paperback".into() };
    let b2 = Book { isbn: 3, format: "Hardcover".into() };
    let b3 = Book { isbn: 10, format: "Paperback".into() };

    // assert!(b1 == b2);
    // assert!(b1 != b3);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
