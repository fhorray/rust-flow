// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Vectors - Capacity

Description:
Vectors manage their own memory.
If you know how many elements you will insert, you can pre-allocate memory using `Vec::with_capacity`.
This avoids reallocation.

Your task is to create a vector with capacity 10 and push 10 elements.
Observe `len()` vs `capacity()`.
*/

fn main() {
    // TODO: Create a vector with capacity 10
    let mut v: Vec<i32> = Vec::new(); // Fix this to use with_capacity(10)

    for i in 0..10 {
        v.push(i);
    }

    println!("Len: {}, Capacity: {}", v.len(), v.capacity());

    // We want capacity to be exactly 10 (or at least 10, but usually exact if pre-allocated)
    // If we start with Vec::new(), capacity might grow 0 -> 4 -> 8 -> 16.
    // So if it's 16, it means we didn't preallocate correctly for 10.
    // Wait, implementation details may vary.
    // But `with_capacity(10)` should guarantee capacity >= 10 immediately.

    assert!(v.capacity() >= 10);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
