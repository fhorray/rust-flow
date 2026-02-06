// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Async - Pinning

Description:
Futures are polled. To be polled, they often need to be `Pin`ned to memory so self-referential structs don't break.

Your task is to fix the `poll` method signature to use `Pin<&mut Self>`.
*/

use std::pin::Pin;
use std::future::Future;
use std::task::{Context, Poll};

struct MyFuture;

impl Future for MyFuture {
    type Output = ();

    // TODO: Fix signature to use Pin<&mut Self>
    // fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        Poll::Ready(())
    }
}

fn main() {}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
