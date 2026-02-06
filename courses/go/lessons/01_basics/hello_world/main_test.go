package main

import "testing"

func TestGreeting(t *testing.T) {
	expected := "Hello World"
	if got := Greeting(); got != expected {
		t.Errorf("Greeting() = %q, want %q", got, expected)
	}
}
