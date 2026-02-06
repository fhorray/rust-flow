// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Lifetimes - Static

Description:
The `'static` lifetime means the reference can live for the entire duration of the program.
String literals have type `&'static str`.

Your task is to fix the function to accept only static strings.
*/

fn main() {
    let s1: &'static str = "I have a static lifetime.";
    let s2: &'static str = "So do I.";
    print_static(s1);
    print_static(s2);

    // let s3 = String::from("I do not.");
    // print_static(&s3); // This should fail
}

// TODO: Fix the signature to require 'static
fn print_static(s: &str) { // Change &str to &'static str
    println!("Static string: {}", s);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
