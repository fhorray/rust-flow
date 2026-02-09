FROM python:3.9-slim
WORKDIR /workspace

# Copy the custom runner script into the image
COPY runner.py /workspace/runner.py

# Default command if none provided
CMD ["python3", "/workspace/runner.py"]
