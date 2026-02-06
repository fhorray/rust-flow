// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Lifetimes - Structs

Description:
Structs can hold references, but they need lifetime annotations to ensure the reference lives as long as the struct.

Your task is to add lifetime annotations to `ImportantExcerpt` so it can hold a reference to a string slice.
*/

// TODO: Add lifetime 'a
struct ImportantExcerpt {
    part: &str, // This needs a lifetime
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");

    // let i = ImportantExcerpt {
    //     part: first_sentence,
    // };

    // println!("{:?}", i.part); // Requires Debug if we want to print struct, or just access field
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
