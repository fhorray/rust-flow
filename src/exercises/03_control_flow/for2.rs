// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - For Loop Enumerate

Description:
Sometimes you need both the index and the value while iterating.
You can use the `.enumerate()` method on an iterator.
It returns a tuple `(index, value)`.

Your task is to iterate over the array `a` and print "Index: {}, Value: {}".
Also, sum the index + value into `checksum`.
*/

fn main() {
    let a = [10, 20, 30, 40, 50];
    let mut checksum = 0;

    // TODO: Use .enumerate() to iterate
    for (i, v) in a.iter().enumerate() {
        println!("Index: {}, Value: {}", i, v);
        // checksum += i + v;
    }

    println!("Checksum: {}", checksum);
    assert_eq!(checksum, 15 + 150); // sum of indices (0+1+2+3+4=10) + sum of values (150) = 160? No wait:
    // indices: 0, 1, 2, 3, 4 = 10
    // values: 10, 20, 30, 40, 50 = 150
    // Total 160.
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
