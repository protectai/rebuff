import secrets
from dataclasses import dataclass
from typing import Union

import requests
from pydantic import BaseModel

from pydantic import BaseModel
from typing import Optional, Dict


class DetectApiRequest(BaseModel):
    input_base64: str
    similarityThreshold: Optional[float]
    runHeuristicCheck: bool
    runVectorCheck: bool
    runLanguageModelCheck: bool


class DetectApiSuccessResponse(BaseModel):
    heuristicScore: float
    modelScore: float
    vectorScore: Dict[str, float]
    runHeuristicCheck: bool
    runVectorCheck: bool
    runLanguageModelCheck: bool


class DetectApiFailureResponse(BaseModel):
    error: str
    message: str


class Rebuff:
    def __init__(self, api_token: str, api_url: str = "https://rebuff.ai"):
        self.api_token = api_token
        self.api_url = api_url

    def is_injection_detected(self, user_input: str, check_heuristic: bool = True, check_vector: bool = True,
                              check_llm: bool = True, vector_similarity: float = 0.9) -> \
            Union[DetectApiSuccessResponse, DetectApiFailureResponse]:
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        user_input_bytes = user_input.encode("utf-8")
        user_input_base64 = user_input_bytes.hex()
        request_data = DetectApiRequest(
            input_base64=user_input_base64,
            vectorSimilarity=vector_similarity,
            runHeuristicCheck=check_heuristic,
            runVectorCheck=check_vector,
            runLanguageModelCheck=check_llm
        )
        request_json = request_data.json()
        response = requests.post(
            f"{self.api_url}/api/detect", json=request_json, headers=headers
        )

        response.raise_for_status()

        response_json = response.json()
        success_response = DetectApiSuccessResponse.parse_obj(response_json)
        return success_response

    def generate_canary_word(self, length: int = 8) -> str:
        # Generate a secure random hexadecimal canary word
        return secrets.token_hex(length // 2)

    def add_canaryword(self, prompt_template: str, canary_word: Optional[str] = None, canary_format: str = "<!-- {canary_word} -->") -> Tuple[str, str]:
        # Generate a canary word if not provided
        if canary_word is None:
            canary_word = self.generate_canary_word()
        # Embed the canary word in the specified format
        canary_comment = canary_format.format(canary_word=canary_word)
        # Append the canary comment to the original prompt
        prompt_with_canary = prompt_template + "\n" + canary_comment
        return canary_word, prompt_with_canary

    def is_canaryword_leaked(self, completion: str, canary_word: str) -> bool:
        # Check if the canary word appears in the completion
        return canary_word in completion

    def log_leakage(self, user_input: str, templated_prompt: str, response: str, canary_word: str):
        pass

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