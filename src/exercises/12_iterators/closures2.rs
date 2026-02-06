// I AM NOT DONE

/*
Difficulty: ⭐
Topic: Closures - Arguments

Description:
Closures can take arguments. The types are usually inferred.

Your task is to define a closure that takes one argument `x` and adds 1 to it.
*/

fn main() {
    // TODO: Define closure
    // let add_one = |x| ...;
    let add_one = |x: i32| x; // This is identity, not add one

    println!("10 + 1 = {}", add_one(10));
    assert_eq!(add_one(10), 11);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
