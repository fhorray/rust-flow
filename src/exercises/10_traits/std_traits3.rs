// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Traits - From and Into

Description:
`From` and `Into` allow lossless type conversions.

Your task is to implement `From<&str>` for `Person`.
*/

#[derive(Debug)]
struct Person {
    name: String,
}

// TODO: Implement From<&str> for Person
// impl From<&str> for Person { ... }

fn main() {
    // let p: Person = "Alice".into();
    // println!("{:?}", p);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
