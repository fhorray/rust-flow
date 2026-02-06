// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐
Topic: Strings - Bytes vs Chars

Description:
`String` is a wrapper over `Vec<u8>`.
`.bytes()` returns raw bytes. `.chars()` returns Unicode scalar values.

Your task is to print the number of bytes and the number of chars in the string "Здравствуйте".
*/

fn main() {
    let s = "Здравствуйте"; // Cyrillic greeting

    // TODO: Get byte length and char count
    let bytes_len = 0;
    let chars_len = 0;

    println!("Bytes: {}, Chars: {}", bytes_len, chars_len);

    // Hint: Cyrillic chars are 2 bytes each usually.
    // 12 chars * 2 = 24 bytes.
    assert_eq!(bytes_len, 24);
    assert_eq!(chars_len, 12);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
