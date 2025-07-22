
import os
import subprocess
import sys


def run_tests():
    try:
        print("Installing test dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-e", ".[dev]"], check=True)
        
        print("\nRunning unit tests...")
        subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/", 
            "-v", 
            "--cov=src", 
            "--cov-report=html", 
            "--cov-report=term"
        ], check=True)
        
        print("\nRunning integration tests...")
        subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/", 
            "-v", 
            "-m", "integration"
        ], check=True)
        
        print("\nAll tests completed successfully!")
        
    except subprocess.CalledProcessError as e:
        print(f"Tests failed with exit code {e.returncode}")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()