import os
import sys

import pytest

try:
    sys.path.insert(
        0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../rebuff"))
    )
except NameError:
    pass

from rebuff import Rebuff


@pytest.mark.usefixtures("server")
def test_integration(server):
    # Initialize the Rebuff SDK with a real API token and URL
    rb = Rebuff(api_token="real_token", api_url="http://localhost:3000")

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
