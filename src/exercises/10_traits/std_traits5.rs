// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Traits - Clone

Description:
`Clone` allows explicit duplication of values.

Your task is to implement `Clone` for `Wrapper` manually.
*/

#[derive(Debug)]
struct Wrapper<T> {
    value: T,
}

// TODO: Implement Clone (where T: Clone)
// impl<T: Clone> Clone for Wrapper<T> { ... }

fn main() {
    let w1 = Wrapper { value: 10 };
    // let w2 = w1.clone();

    // println!("{:?}", w2);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
