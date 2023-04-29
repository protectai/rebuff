from dataclasses import dataclass
from typing import Union

import requests
from pydantic import BaseModel


class DetectApiRequest(BaseModel):
    input_base64: str


class DetectApiSuccessResponse(BaseModel):
    heuristicScore: float
    modelScore: float
    vectorScore: float


class DetectApiFailureResponse(BaseModel):
    error: str
    message: str


class Rebuff:
    def __init__(self, api_token: str, api_url: str = "https://rebuff.ai"):
        self.api_token = api_token
        self.api_url = api_url

    def is_injection_detected(self, user_input: str) -> Union[DetectApiSuccessResponse, DetectApiFailureResponse]:
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        user_input_bytes = user_input.encode("utf-8")
        user_input_base64 = user_input_bytes.hex()
        request_data = DetectApiRequest(input_base64=user_input_base64)
        request_json = request_data.json()
        response = requests.post(
            f"{self.api_url}/api/detect", json=request_json, headers=headers
        )

        response.raise_for_status()

        response_json = response.json()
        success_response = DetectApiSuccessResponse.parse_obj(response_json)
        return success_response

    def detect_leakage(self, output_text, canary_word):
        headers = {"Authorization": f"Bearer {self.api_token}"}
        data = {
            "action": "detectLeakage",
            "outputText": output_text,
            "canaryWord": canary_word,
        }
        response = requests.post(self.api_url, json=data, headers=headers)
        response.raise_for_status()
        return response.json()

    def add_canaryword(self, prompt_template):
        pass

    def is_canaryword_leaked(self, completion, canary_word):
        pass
