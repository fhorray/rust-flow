// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Iterators - Cloned vs Copied

Description:
`iter()` yields references. `cloned()` turns `&T` into `T` by cloning. `copied()` does the same for Copy types.

Your task is to use `cloned` to create a `Vec<String>` from `Vec<&String>`.
*/

fn main() {
    let s1 = String::from("a");
    let s2 = String::from("b");
    let v_refs = vec![&s1, &s2];

    // TODO: Use cloned() to get owned strings
    let v_owned: Vec<String> = vec![]; // v_refs.into_iter().cloned().collect();

    println!("Owned: {:?}", v_owned);
    assert_eq!(v_owned, vec!["a", "b"]);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
