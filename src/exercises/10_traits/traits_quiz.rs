// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Traits Quiz

Description:
Implement a trait `Summarizable` with a method `summary(&self) -> String`.
Implement it for `Vec<T>` where `T: Summarizable`.
The summary of a vector should be "List of [summary of first element, ...]".
Wait, that's recursive.
Let's make it simpler: `Vec<String>`.
Task: Implement `Summarizable` for `String` and `Vec<String>`.
*/

trait Summarizable {
    fn summary(&self) -> String;
}

// TODO: Implement for String
// impl Summarizable for String { ... }

// TODO: Implement for Vec<String>
// impl Summarizable for Vec<String> { ... }

fn main() {
    let s = String::from("hello");
    // println!("{}", s.summary());

    let v = vec![String::from("a"), String::from("b")];
    // println!("{}", v.summary());
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
