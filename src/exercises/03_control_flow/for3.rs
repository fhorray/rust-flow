// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Control Flow - Iterating Arrays

Description:
When iterating over an array, you often want to borrow its elements rather than move them (though arrays of primitives are Copy).
Use `&array` or `array.iter()` to iterate over references.

Your task is to iterate over the array `names` and check if "Ferris" is in the list.
*/

fn main() {
    let names = ["Alice", "Bob", "Ferris", "Dave"];
    let mut found_ferris = false;

    // TODO: Iterate over names
    // for name in ... {
    //    if *name == "Ferris" { found_ferris = true; }
    // }

    println!("Found Ferris? {}", found_ferris);
    assert!(found_ferris);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
