// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Iterators - Filter

Description:
`filter` allows you to keep only elements that satisfy a condition.

Your task is to filter `v` to keep only even numbers.
*/

fn main() {
    let v = vec![1, 2, 3, 4, 5, 6];

    // TODO: Filter even numbers
    let evens: Vec<i32> = v.into_iter().filter(|x| false).collect(); // Fix predicate

    println!("Evens: {:?}", evens);
    assert_eq!(evens, vec![2, 4, 6]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
