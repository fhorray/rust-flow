import sys
import subprocess
import json
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: runner.py <file>")
        # Default behavior if no file specified
        sys.exit(1)

    file_to_run = sys.argv[1]

    try:
        # Run the student's code
        # We assume the file is relative to /workspace
        full_path = f"/workspace/{file_to_run}"
        
        if not os.path.exists(full_path):
             srp = {
                "success": False,
                "summary": "File Not Found",
                "raw": f"Could not find file: {file_to_run}"
            }
             print("__SRP_BEGIN__")
             print(json.dumps(srp))
             print("__SRP_END__")
             return

        result = subprocess.run(
            ["python3", full_path],
            capture_output=True,
            text=True,
            timeout=5
        )

        stdout = result.stdout
        stderr = result.stderr
        return_code = result.returncode

        success = return_code == 0
        summary = "Code executed successfully." if success else "Runtime Error"
        
        if not success:
             summary = f"Code failed with exit code {return_code}"

        # Construct the SRP output
        srp = {
            "success": success,
            "summary": summary,
            "raw": stdout + (stderr if stderr else ""),
            "tests": [] 
        }

        print("__SRP_BEGIN__")
        print(json.dumps(srp))
        print("__SRP_END__")

    except subprocess.TimeoutExpired:
        srp = {
            "success": False,
            "summary": "Timeout Error",
            "raw": "Code execution timed out after 5 seconds."
        }
        print("__SRP_BEGIN__")
        print(json.dumps(srp))
        print("__SRP_END__")
    except Exception as e:
        srp = {
            "success": False,
            "summary": "Internal Runner Error",
            "raw": str(e)
        }
        print("__SRP_BEGIN__")
        print(json.dumps(srp))
        print("__SRP_END__")

if __name__ == "__main__":
    main()
