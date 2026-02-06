// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Vectors - Pushing

Description:
You can add elements to a vector using `push`. The vector must be mutable.

Your task is to push 10, 20, 30 into `v`.
*/

fn main() {
    let mut v = Vec::new();

    // TODO: Push 10, 20, 30


    println!("Vector: {:?}", v);
    assert_eq!(v, [10, 20, 30]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
