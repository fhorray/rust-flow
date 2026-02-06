package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

type SRPDiagnostic struct {
	Severity   string `json:"severity"`
	Message    string `json:"message"`
	File       string `json:"file,omitempty"`
	Line       int    `json:"line,omitempty"`
	Column     int    `json:"column,omitempty"`
	Snippet    string `json:"snippet,omitempty"`
	Suggestion string `json:"suggestion,omitempty"`
}

type SRPTest struct {
	Name    string `json:"name"`
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
}

type SRPOutput struct {
	Success     bool            `json:"success"`
	Summary     string          `json:"summary"`
	Diagnostics []SRPDiagnostic `json:"diagnostics,omitempty"`
	Tests       []SRPTest       `json:"tests,omitempty"`
	Raw         string          `json:"raw"`
}

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: runner <type> <id>")
		os.Exit(1)
	}

	commandType := os.Args[1]
	exerciseID := os.Args[2]

	if commandType != "test" {
		fmt.Println("Only 'test' command is supported")
		os.Exit(1)
	}

	runTest(exerciseID)
}

func runTest(id string) {
	cmd := exec.Command("go", "test", "-v", "./lessons/"+id)
	output, _ := cmd.CombinedOutput()
	rawOutput := string(output)

	srp := SRPOutput{
		Success: cmd.ProcessState.Success(),
		Raw:     rawOutput,
		Summary: "Test execution completed",
	}

	// State-based parsing of Go test output
	scanner := bufio.NewScanner(strings.NewReader(rawOutput))
	var currentTest string
	testLogs := make(map[string][]string)

	for scanner.Scan() {
		line := scanner.Text()
		
		// 1. Identify test start
		if strings.HasPrefix(line, "=== RUN   ") {
			currentTest = strings.TrimSpace(strings.Replace(line, "=== RUN   ", "", 1))
			continue
		}

		// 2. Identify test status
		if strings.HasPrefix(line, "--- PASS:") {
			name := strings.TrimSpace(strings.Replace(line, "--- PASS:", "", 1))
			if idx := strings.Index(name, " ("); idx != -1 {
				name = name[:idx]
			}
			msg := ""
			if logs, ok := testLogs[name]; ok {
				msg = strings.Join(logs, "\n")
			}
			srp.Tests = append(srp.Tests, SRPTest{
				Name:    name,
				Status:  "pass",
				Message: msg,
			})
			currentTest = ""
			continue
		} else if strings.HasPrefix(line, "--- FAIL:") {
			name := strings.TrimSpace(strings.Replace(line, "--- FAIL:", "", 1))
			if idx := strings.Index(name, " ("); idx != -1 {
				name = name[:idx]
			}
			msg := ""
			if logs, ok := testLogs[name]; ok {
				msg = strings.Join(logs, "\n")
			}
			srp.Tests = append(srp.Tests, SRPTest{
				Name:    name,
				Status:  "fail",
				Message: msg,
			})
			currentTest = ""
			continue
		}

		// 3. Collect logs/output for current test
		if currentTest != "" && strings.HasPrefix(line, "    ") {
			testLogs[currentTest] = append(testLogs[currentTest], strings.TrimSpace(line))
		}

		// 4. Basic error parsing for diagnostics (compilation errors, etc.)
		if strings.Contains(line, ":") && (strings.Contains(line, "error:") || strings.Contains(line, "undefined:") || strings.Contains(line, "invalid operation:")) {
			parts := strings.Split(line, ":")
			if len(parts) >= 3 {
				file := strings.TrimSpace(parts[0])
				lineNum := 0
				fmt.Sscanf(parts[1], "%d", &lineNum)
				msg := strings.TrimSpace(strings.Join(parts[2:], ":"))

				// Avoid duplicates if same error shows up multiple times
				isDuo := false
				for _, d := range srp.Diagnostics {
					if d.Message == msg && d.Line == lineNum {
						isDuo = true
						break
					}
				}
				if !isDuo {
					srp.Diagnostics = append(srp.Diagnostics, SRPDiagnostic{
						Severity: "error",
						Message:  msg,
						File:     file,
						Line:     lineNum,
					})
				}
			}
		}
	}

	if srp.Success {
		srp.Summary = fmt.Sprintf("All tests passed for %s", id)
	} else {
		srp.Summary = fmt.Sprintf("Tests failed for %s", id)
	}

	// Output SRP JSON
	jsonData, _ := json.MarshalIndent(srp, "", "  ")
	fmt.Println("__SRP_BEGIN__")
	fmt.Println(string(jsonData))
	fmt.Println("__SRP_END__")

	if !srp.Success {
		os.Exit(0)
	}
}
