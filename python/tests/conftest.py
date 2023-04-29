import os
import sys
from typing import Any, Callable, Generator
from unittest.mock import Mock

import requests

try:
    sys.path.insert(
        0,
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../rebuff")),
    )
except NameError:
    pass
import subprocess
import time

import pytest


# Define a fixture to manage the Next.js server's lifecycle
@pytest.fixture(scope="session")
def server() -> Generator[None, None, None]:
    # Check if the server is already running
    server_already_running = False
    try:
        response = requests.get("http://localhost:3000")
        if response.status_code == 200:
            server_already_running = True
    except requests.exceptions.ConnectionError:
        pass

    if not server_already_running:
        # Get the absolute path to the root of the Git repository
        git_root = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()

        # Start the Next.js server as a subprocess
        server = subprocess.Popen(
            ["npm", "run", "dev"], cwd=f"{git_root}/server"
        )

        # Wait for the server to start (adjust the sleep time as needed)
        time.sleep(3)

        # Yield control to the test function
        yield

        # Stop the server subprocess after the tests are completed
        server.terminate()
    else:
        # Yield control to the test function without starting the server
        yield


# Define a fixture for the fake API backend
@pytest.fixture
def fake_api_backend() -> Callable[[Any], Any]:
    def _fake_api_backend(response_data: str) -> Mock:
        mock_response = Mock()
        mock_response.json.return_value = response_data
        mock_response.raise_for_status.return_value = None
        return mock_response

    return _fake_api_backend
