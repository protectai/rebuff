import os
import sys

from rebuff import Rebuff

try:
    sys.path.insert(
        0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../rebuff"))
    )
except NameError:
    pass
import subprocess
import time
import pytest


# Define a fixture to manage the Next.js server's lifecycle
@pytest.fixture(scope="session", autouse=True)
def nextjs_server():
    # Get the absolute path to the root of the Git repository
    git_root = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
        check=True
    ).stdout.strip()

    # Start the Next.js server as a subprocess
    server = subprocess.Popen(["npm", "run", "dev"], cwd=f"{git_root}/server")

    # Wait for the server to start (adjust the sleep time as needed)
    time.sleep(5)

    # Yield control to the test function
    yield

    # Stop the server subprocess after the tests are completed
    server.terminate()

def test_integration():
    # Initialize the Rebuff SDK with a real API token and URL
    rb = Rebuff(api_token="real_token", api_url="http://localhost:3000/api/detect")

    # Test the is_injection_detected method
    user_input = "Find all users; DROP TABLE users;"
    result = rb.is_injection_detected(user_input)
    assert "heuristicScore" in result
    assert "modelScore" in result
    assert "vectorScore" in result

    # Test the detect_leakage method
    output_text = "SELECT * FROM users; DROP TABLE users;"
    canary_word = "canary123"
    result = rb.detect_leakage(output_text, canary_word)
    assert "leakageDetected" in result