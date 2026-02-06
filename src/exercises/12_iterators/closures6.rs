// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Closures - Fn Traits

Description:
Closures implement `Fn`, `FnMut`, or `FnOnce` traits depending on how they capture variables.
- `Fn`: Captures by reference (&T)
- `FnMut`: Captures by mutable reference (&mut T)
- `FnOnce`: Captures by value (T) - consumes the closure

Your task is to pass a closure that modifies a variable to `call_mut`.
This requires `FnMut`.
*/

// Takes a closure that takes no args and returns nothing
fn call_mut<F>(mut f: F)
where
    F: FnMut(),
{
    f();
}

fn main() {
    let mut x = 10;

    // TODO: Pass a closure that increments x
    call_mut(|| {
        // x += 1;
    });

    println!("x is {}", x);
    assert_eq!(x, 11);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
