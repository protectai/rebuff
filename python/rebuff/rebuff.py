import secrets
from typing import Union, Tuple

import requests

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
        self._headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

    def is_injection_detected(
            self,
            user_input: str,
            check_heuristic: bool = True,
            check_vector: bool = True,
            check_llm: bool = True,
            vector_similarity: float = 0.9,
    ) -> Union[DetectApiSuccessResponse, DetectApiFailureResponse]:

        request_data = DetectApiRequest(
            input_base64=encode_string(user_input),
            vectorSimilarity=vector_similarity,
            runHeuristicCheck=check_heuristic,
            runVectorCheck=check_vector,
            runLanguageModelCheck=check_llm,
        )
        request_json = request_data.json()
        response = requests.post(
            f"{self.api_url}/api/detect", json=request_json, headers=self._headers
        )

        response.raise_for_status()

        response_json = response.json()
        success_response = DetectApiSuccessResponse.parse_obj(response_json)
        return success_response

    @staticmethod
    def generate_canary_word(length: int = 8) -> str:
        # Generate a secure random hexadecimal canary word
        return secrets.token_hex(length // 2)

    @staticmethod
    def add_canaryword(
            prompt_template: str,
            canary_word: Optional[str] = None,
            canary_format: str = "<!-- {canary_word} -->",
    ) -> Tuple[str, str]:
        # Generate a canary word if not provided
        if canary_word is None:
            canary_word = Rebuff.generate_canary_word()
        # Embed the canary word in the specified format
        canary_comment = canary_format.format(canary_word=canary_word)
        # Append the canary comment to the original prompt
        prompt_with_canary = prompt_template + "\n" + canary_comment
        return canary_word, prompt_with_canary

    def is_canaryword_leaked(self,
            completion: str, canary_word: str, log_outcome: bool = True
    ) -> bool:
        # Check if the canary word appears in the completion
        if canary_word in completion:
            if log_outcome:
                Rebuff.log_leakage(completion, canary_word)
            return True
        return False

    def log_leakage(
            self, user_input: str, templated_prompt: str, response: str, canary_word: str
    ):
        # Log relevant information if a canary word is detected in the response
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
        data = {
            "userInput": user_input,
            "templatedPrompt": templated_prompt,
            "response": response,
            "canaryWord": canary_word,
        }
        response = requests.post(
            f"{self.api_url}/api/log_leakage", json=data, headers=self._headers
        )
        response.raise_for_status()
        return response.json()


def encode_string(self, input: str) -> str:
    return input.encode("utf-8").hex()
