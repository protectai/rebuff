import secrets
from typing import Any, Dict, Optional, Tuple, Union

import requests
from pydantic import BaseModel


class DetectApiRequest(BaseModel):
    input_base64: str
    run_heuristic_check: bool
    run_vector_check: bool
    run_language_model_check: bool
    max_heuristic_score: float
    max_model_score: float
    max_vector_score: float


class DetectApiSuccessResponse(BaseModel):
    heuristic_score: float
    model_score: float
    vector_score: Dict[str, float]
    run_heuristic_check: bool
    run_vector_check: bool
    run_language_model_check: bool


class ApiFailureResponse(BaseModel):
    error: str
    message: str


class Rebuff:
    def __init__(self, api_token: str, api_url: str = "https://playground.rebuff.ai"):
        self.api_token = api_token
        self.api_url = api_url
        self.headers = {
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
    ) -> Tuple[Union[DetectApiSuccessResponse, ApiFailureResponse], bool]:
        """
        Detects if the given user input contains an injection attempt.

        Args:
            user_input (str): The user input to be checked for injection.
            max_heuristic_score (float, optional): The maximum heuristic score allowed. Defaults to 0.75.
            max_vector_score (float, optional): The maximum vector score allowed. Defaults to 0.90.
            max_model_score (float, optional): The maximum model (LLM) score allowed. Defaults to 0.9.
            check_heuristic (bool, optional): Whether to run the heuristic check. Defaults to True.
            check_vector (bool, optional): Whether to run the vector check. Defaults to True.
            check_llm (bool, optional): Whether to run the language model check. Defaults to True.

        Returns:
            Tuple[Union[DetectApiSuccessResponse, ApiFailureResponse], bool]: A tuple containing the detection
                metrics and a boolean indicating if an injection was detected.
        """
        request_data = DetectApiRequest(
            input_base64=encode_string(user_input),
            run_heuristic_check=check_heuristic,
            run_vector_check=check_vector,
            run_language_model_check=check_llm,
            max_heuristic_score=max_heuristic_score,
            max_vector_score=max_vector_score,
            max_model_score=max_model_score,
        )

        response = requests.post(
            f"{self.api_url}/api/detect",
            json=request_data.dict(),
            headers=self.headers,
        )
        response.raise_for_status()

        success_response = DetectApiSuccessResponse.parse_obj(response.json())

        injection_detected = (
            success_response.heuristic_score > max_heuristic_score
            or success_response.model_score > max_model_score
            or success_response.vector_score["top_score"] > max_vector_score
        )

        return success_response, injection_detected

    @staticmethod
    def generate_canary_word(length: int = 8) -> str:
        """
        Generates a secure random hexadecimal canary word.

        Args:
            length (int, optional): The length of the canary word. Defaults to 8.

        Returns:
            str: The generated canary word.
        """
        return secrets.token_hex(length // 2)

    def add_canary_word(
        self,
        prompt: Any,
        canary_word: Optional[str] = None,
        canary_format: str = "<!-- {canary_word} -->",
    ) -> Tuple[Any, str]:
        """
        Adds a canary word to the given prompt which we will use to detect leakage.

        Args:
            prompt (Any): The prompt to add the canary word to.
            canary_word (Optional[str], optional): The canary word to add. If not provided, a random canary word will be
             generated. Defaults to None.
            canary_format (str, optional): The format in which the canary word should be added.
            Defaults to "<!-- {canary_word} -->".

        Returns:
            Tuple[Any, str]: A tuple containing the modified prompt with the canary word and the canary word itself.
        """
        if canary_word is None:
            canary_word = self.generate_canary_word()

        canary_comment = canary_format.format(canary_word=canary_word)

        if isinstance(prompt, str):
            prompt_with_canary = canary_comment + "\n" + prompt
            return prompt_with_canary, canary_word

        try:
            import langchain

            if isinstance(prompt, langchain.PromptTemplate):
                prompt.template = canary_comment + "\n" + prompt.template
                return prompt, canary_word
        except ImportError:
            pass

        raise TypeError(
            f"prompt must be a PromptTemplate or a str, but was {type(prompt)}"
        )

    def is_canary_word_leaked(
        self,
        user_input: str,
        completion: str,
        canary_word: str,
        log_outcome: bool = True,
    ) -> bool:
        """
        Checks if the canary word is leaked in the completion.

        Args:
            user_input (str): The user input.
            completion (str): The completion generated by the AI.
            canary_word (str): The canary word to check for leakage.
            log_outcome (bool, optional): Whether to log the outcome of the leakage check. Defaults to True.

        Returns:
            bool: True if the canary word is leaked, False otherwise.
        """
        if canary_word in completion:
            if log_outcome:
                self.log_leakage(user_input, completion, canary_word)
            return True
        return False

    def log_leakage(
        self, user_input: str, completion: str, canary_word: str
    ) -> None:
        """
        Logs the leakage of a canary word.

        Args:
            user_input (str): The user input.
            completion (str): The completion generated by the AI.
            canary_word (str): The leaked canary word.
        """
        data = {
            "user_input": user_input,
            "completion": completion,
            "canaryWord": canary_word,
        }
        response = requests.post(
            f"{self.api_url}/api/log", json=data, headers=self.headers
        )
        response.raise_for_status()


def encode_string(message: str) -> str:
    return message.encode("utf-8").hex()
