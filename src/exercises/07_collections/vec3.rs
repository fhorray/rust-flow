// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Vectors - Accessing Elements

Description:
You can access elements using `[]` (panics if out of bounds) or `.get()` (returns Option).

Your task is to use `.get()` to access the third element (index 2) and print it.
If it doesn't exist, print "None".
*/

fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // TODO: Use .get()
    let third = v.get(100); // Intentionally out of bounds for now

    match third {
        Some(x) => println!("The third element is {}", x),
        None => println!("There is no third element."),
    }

    // Fix the index to be 2
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
