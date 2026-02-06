// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐⭐
Topic: Control Flow Quiz - State Machine

Description:
A state machine can be implemented using an enum and a match expression.

Your task is to implement the `next_state` function.
It takes a `current_state` and an `input` and returns the next state.
States: Off, Loading, Ready.
Transitions:
- Off + PowerButton -> Loading
- Loading + Loaded -> Ready
- Ready + PowerButton -> Off
- Anything else -> Keep current state
*/

#[derive(Debug, PartialEq)]
enum State {
    Off,
    Loading,
    Ready,
}

#[derive(Debug, PartialEq)]
enum Input {
    PowerButton,
    Loaded,
    Unknown,
}

fn next_state(current: State, input: Input) -> State {
    // TODO: Implement the transition logic using match
    match (current, input) {
        (State::Off, Input::PowerButton) => State::Loading,

        // TODO: Handle other transitions

        // Keep current state for everything else
        (s, _) => s,
    }
}

fn main() {
    let mut state = State::Off;

    state = next_state(state, Input::PowerButton);
    assert_eq!(state, State::Loading);

    state = next_state(state, Input::Loaded);
    assert_eq!(state, State::Ready);

    state = next_state(state, Input::PowerButton);
    assert_eq!(state, State::Off);

    println!("Success!");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
