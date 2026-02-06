// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Vectors - Mutable Iteration

Description:
To modify elements in place, use a mutable iterator.

Your task is to iterate over `v` mutably and add 1 to each element.
*/

fn main() {
    let mut v = vec![1, 2, 3];

    // TODO: Iterate mutably
    // for x in ... {
    //     *x += 1;
    // }

    println!("v: {:?}", v);
    assert_eq!(v, [2, 3, 4]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
