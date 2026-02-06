// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Lifetimes - Structs and Impl

Description:
You must declare lifetimes in `impl` blocks too.

Your task is to fix the `impl` block for `ImportantExcerpt`.
*/

struct ImportantExcerpt<'a> {
    part: &'a str,
}

// TODO: Fix the impl block
impl ImportantExcerpt { // Missing lifetimes
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {}", announcement);
        self.part
    }
}

fn main() {
    let i = ImportantExcerpt { part: "hello" };
    i.announce_and_return_part("hi");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        // super::main();
    }
}
