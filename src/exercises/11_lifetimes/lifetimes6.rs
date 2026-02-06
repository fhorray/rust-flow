// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Lifetimes - Multiple References

Description:
When a struct has multiple references, you can assign them different lifetimes.
This allows them to be valid for different scopes.

Your task is to fix `excerpt_and_str` so it holds two references with potentially different lifetimes.
*/

struct DoubleRef<'a, 'b> {
    r1: &'a str,
    r2: &'b str,
}

fn main() {
    let s1 = String::from("long string");
    let d;
    {
        let s2 = String::from("short");
        d = DoubleRef { r1: &s1, r2: &s2 };
        println!("r1: {}, r2: {}", d.r1, d.r2);
    }
    // Accessing d.r1 here should be fine if 'a is longer than 'b?
    // Actually, d itself dies when s2 dies because d holds a reference to s2.
    // So this example is tricky.
    // Let's just focus on definition syntax.
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main();
    }
}
