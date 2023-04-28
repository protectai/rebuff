import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../rebuff')))
from rebuff import Rebuff
from unittest.mock import Mock


# Define a fixture for the fake API backend
@pytest.fixture
def fake_api_backend():
    def _fake_api_backend(response_data):
        mock_response = Mock()
        mock_response.json.return_value = response_data
        mock_response.raise_for_status.return_value = None
        return mock_response

    return _fake_api_backend


# Define a test for the is_injection_detected method
def test_is_injection_detected(fake_api_backend, monkeypatch):
    # Stub out the response from the fake API backend
    response_data = {
        "heuristicScore": 1,
        "modelScore": 0.8,
        "vectorScore": 0
    }
    mock_post = Mock(return_value=fake_api_backend(response_data))
    monkeypatch.setattr("requests.post", mock_post)

    # Initialize the Rebuff SDK with a fake API token and URL
    rb = Rebuff(api_token="fake_token", api_url="https://fake-api.rebuff.ai/detect")

    # Test the is_injection_detected method
    user_input = "Find all users; DROP TABLE users;"
    result = rb.is_injection_detected(user_input)

    # Assert that the result matches the expected response data
    assert result == response_data

    # Assert that the API was called with the correct parameters
    mock_post.assert_called_once_with(
        "https://fake-api.rebuff.ai/detect",
        json={"user_input": user_input},
        headers={"Authorization": "Bearer fake_token"}
    )
