// I AM NOT DONE

/*
Difficulty: ⭐⭐
Topic: Traits - Ord and PartialOrd

Description:
`Ord` allows ordering (`<`, `>`, `<=`, `>=`).

Your task is to derive `Ord`, `PartialOrd`, `Eq`, `PartialEq` for `Card`.
Ordering should be based on variants definition order (Ace < King ...).
Wait, normally Ace is high or low. Let's assume definition order is fine.
*/

// TODO: Add derive macros
#[derive(Debug)]
enum Card {
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace,
}

fn main() {
    // assert!(Card::Ace > Card::King);
    // assert!(Card::Two < Card::Three);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
