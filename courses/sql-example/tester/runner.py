import sys
import os
import json
import psycopg2

def main():
    if len(sys.argv) < 2:
        print("Usage: runner.py <sql_file>")
        sys.exit(1)

    file_rel_path = sys.argv[1] # e.g. exercises/01_select/query.sql
    full_path = f"/workspace/{file_rel_path}"

    # Database connection parameters from Environment
    db_host = os.environ.get("DB_HOST", "db")
    db_name = os.environ.get("DB_NAME", "course_db")
    db_user = os.environ.get("DB_USER", "progy")
    db_pass = os.environ.get("DB_PASS", "password")

    try:
        # Read student SQL
        if not os.path.exists(full_path):
             raise FileNotFoundError(f"File not found: {file_rel_path}")

        with open(full_path, "r") as f:
            student_sql = f.read().strip()

        if not student_sql:
             raise ValueError("SQL file is empty.")

        # Connect to DB
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_pass
        )
        cur = conn.cursor()

        # Execute Student SQL
        try:
            cur.execute(student_sql)

            # Fetch results if it's a SELECT
            rows = []
            if cur.description:
                rows = cur.fetchall()
                col_names = [desc[0] for desc in cur.description]
                raw_output = f"Columns: {col_names}\n"
                for row in rows:
                    raw_output += str(row) + "\n"
            else:
                raw_output = "Query executed successfully (No rows returned)."

            conn.commit()

            # Basic Assertion Logic (Hardcoded for this example, but could be dynamic)
            # Check if we got 3 users
            success = True
            summary = "Query executed successfully!"

            # Example Validation: Ensure we selected all users
            if "select" in student_sql.lower() and len(rows) != 3:
                success = False
                summary = f"Expected 3 rows, got {len(rows)}."
            elif "select" in student_sql.lower() and len(rows) == 3:
                 summary = "Correct! You selected all users."

        except Exception as e:
            success = False
            summary = "SQL Error"
            raw_output = str(e)
            conn.rollback()

        cur.close()
        conn.close()

        srp = {
            "success": success,
            "summary": summary,
            "raw": raw_output
        }

        print("__SRP_BEGIN__")
        print(json.dumps(srp))
        print("__SRP_END__")

    except Exception as e:
        srp = {
            "success": False,
            "summary": "Runner Error",
            "raw": str(e)
        }
        print("__SRP_BEGIN__")
        print(json.dumps(srp))
        print("__SRP_END__")

if __name__ == "__main__":
    main()
