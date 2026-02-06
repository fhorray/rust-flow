// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Async Quiz

Description:
Implement a simple async function `fetch_url` that returns a string.
Then use `block_on` (simulated) to run it.
*/

async fn fetch_url(url: &str) -> String {
    format!("Content of {}", url)
}

fn block_on<F: std::future::Future>(f: F) -> F::Output {
    // Magic happens here
    unimplemented!()
}

fn main() {
    let url = "https://rust-lang.org";
    // TODO: Call fetch_url and block_on
    // let content = ...;
    // println!("{}", content);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
