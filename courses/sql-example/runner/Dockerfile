FROM python:3.9-slim

WORKDIR /app

# Install dependencies for psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install python postgres driver
RUN pip install psycopg2-binary

COPY runner.py /app/runner.py

# Keep container alive if needed, or default to runner
CMD ["python3", "/app/runner.py"]
