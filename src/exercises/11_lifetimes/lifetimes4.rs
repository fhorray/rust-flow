// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Lifetimes - Methods

Description:
Methods on structs with lifetimes also need annotations.
Usually elision handles this, but sometimes you need to be explicit.

Your task is to implement the `level` method for `ImportantExcerpt`.
It should return the `part` field.
*/

struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    // TODO: Implement level method returning &str
    // fn level(&self) -> &str { ... }
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };

    // println!("Level: {}", i.level());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
