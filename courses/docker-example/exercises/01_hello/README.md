# Hello Docker
This is a simple exercise that runs inside a local Docker container.

## Instructions
1.  Run the code to see the output.
2.  The output is captured by the `runner.py` script inside the container.
3.  The result is sent back to the Progy CLI as JSON.

## How it works
Your code is mounted into `/workspace` inside the container.
The CLI runs: `docker run -v $(pwd):/workspace ... python3 /workspace/runner.py exercises/01_hello/main.py`
