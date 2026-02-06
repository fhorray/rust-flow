// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Iterators - Inspect

Description:
`inspect` allows you to peek at elements as they pass through the iterator, usually for debugging.
It doesn't transform the element.

Your task is to use `inspect` to print "About to filter: {x}" before filtering for even numbers.
*/

fn main() {
    let v = vec![1, 2, 3, 4, 5];

    let evens: Vec<i32> = v
        .into_iter()
        // TODO: Add inspect here
        .filter(|x| x % 2 == 0)
        .collect();

    println!("Evens: {:?}", evens);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
