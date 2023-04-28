import pytest
from rebuff import Rebuff

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