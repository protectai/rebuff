import secrets
from typing import Any, Dict, Optional, Union

import requests
from pydantic import BaseModel


class DetectApiRequest(BaseModel):
    input_base64: str
    runHeuristicCheck: bool
    runVectorCheck: bool
    runLanguageModelCheck: bool
    maxHeuristicScore: float
    maxModelScore: float
    maxVectorScore: float


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

    def detect_injection(
        self,
        user_input: str,
        max_heuristic_score: float = 0.75,
        max_vector_score: float = 0.90,
        max_model_score: float = 0.9,
        check_heuristic: bool = True,
        check_vector: bool = True,
        check_llm: bool = True,
    ) -> tuple[
        Union[DetectApiSuccessResponse, DetectApiFailureResponse], bool
    ]:
        request_data = DetectApiRequest(
            input_base64=encode_string(user_input),
            runHeuristicCheck=check_heuristic,
            runVectorCheck=check_vector,
            runLanguageModelCheck=check_llm,
            maxVectorScore=max_vector_score,
            maxModelScore=max_model_score,
            maxHeuristicScore=max_heuristic_score,
        )

        response = requests.post(
            f"{self.api_url}/api/detect",
            json=request_data.dict(),
            headers=self._headers,
        )

        response.raise_for_status()

        response_json = response.json()
        success_response = DetectApiSuccessResponse.parse_obj(response_json)

        if (
            success_response.heuristicScore > max_heuristic_score
            or success_response.modelScore > max_model_score
            or success_response.vectorScore["topScore"] > max_vector_score
        ):
            # Injection detected
            return success_response, True
        else:
            # No injection detected
            return success_response, False

    def generate_canary_word(self, length: int = 8) -> str:
        # Generate a secure random hexadecimal canary word
        return secrets.token_hex(length // 2)

    def add_canaryword(
        self,
        prompt: Any,
        canary_word: Optional[str] = None,
        canary_format: str = "<!-- {canary_word} -->",
    ) -> tuple[Any, str]:
        # Generate a canary word if not provided
        if canary_word is None:
            canary_word = self.generate_canary_word()

        # Embed the canary word in the specified format
        canary_comment = canary_format.format(canary_word=canary_word)
        if isinstance(prompt, str):
            prompt_with_canary: str = canary_comment + "\n" + prompt
            return prompt_with_canary, canary_word

        try:
            from langchain import PromptTemplate

            if isinstance(prompt, PromptTemplate):
                prompt.template = canary_comment + "\n" + prompt.template
                return prompt, canary_word
        except ImportError:
            pass

        raise TypeError(
            f"prompt_template must be a PromptTemplate or a str, "
            f"but was {type(prompt)}"
        )

    def is_canaryword_leaked(
        self,
        user_input: str,
        completion: str,
        canary_word: str,
        log_outcome: bool = True,
    ) -> bool:
        # Check if the canary word appears in the completion
        if canary_word in completion:
            if log_outcome:
                self.log_leakage(user_input, completion, canary_word)
            return True
        return False

    def log_leakage(
        self, user_input: str, completion: str, canary_word: str
    ) -> None:
        data = {
            "user_input": user_input,
            "completion": completion,
            "canaryWord": canary_word,
        }
        response = requests.post(
            f"{self.api_url}/api/log", json=data, headers=self._headers
        )
        response.raise_for_status()
        return


def encode_string(message: str) -> str:
    return message.encode("utf-8").hex()
