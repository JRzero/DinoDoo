package main

import "testing"

func TestSafetyGuardMatchesEnglishWordsWithoutSubstringFalsePositives(t *testing.T) {
	guard := NewSafetyGuard()
	if flags := guard.CheckInput("gentle preschool game character art"); len(flags) != 0 {
		t.Fatalf("preschool should not match private word school: %v", flags)
	}
	if flags := guard.CheckInput("my school is nearby"); len(flags) == 0 {
		t.Fatal("standalone private word school should still be blocked")
	}
	if flags := guard.CheckInput("not scary"); len(flags) == 0 {
		t.Fatal("standalone safety word scary should still be blocked")
	}
}
