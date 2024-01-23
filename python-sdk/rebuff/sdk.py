import secrets
from typing import Optional, Tuple, Union

from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel

from rebuff.detect_pi_heuristics import detect_prompt_injection_using_heuristic_on_input
from rebuff.detect_pi_openai import (
    call_openai_to_detect_pi,
    render_prompt_for_pi_detection,
)
from rebuff.detect_pi_vectorbase import detect_pi_using_vector_database, init_pinecone


class RebuffDetectionResponse(BaseModel):
    heuristic_score: float
    openai_score: float
    vector_score: float
    run_heuristic_check: bool
    run_vector_check: bool
    run_language_model_check: bool
    max_heuristic_score: float
    max_model_score: float
    max_vector_score: float
    injection_detected: bool


class RebuffSdk:
    def __init__(
        self,
        openai_apikey: str,
        pinecone_apikey: str,
        pinecone_index: str,
        openai_model: str = "gpt-3.5-turbo",
    ) -> None:
        self.openai_model = openai_model
        self.openai_apikey = openai_apikey
        self.pinecone_apikey = pinecone_apikey
        self.pinecone_index = pinecone_index
        self.vector_store = None

    def initialize_pinecone(self) -> None:
        self.vector_store = init_pinecone(
            self.pinecone_apikey,
            self.pinecone_index,
            self.openai_apikey,
        )

    def detect_injection(
        self,
        user_input: str,
        max_heuristic_score: float = 0.75,
        max_vector_score: float = 0.90,
        max_model_score: float = 0.90,
        check_heuristic: bool = True,
        check_vector: bool = True,
        check_llm: bool = True,
    ) -> RebuffDetectionResponse:
        """
        Detects if the given user input contains an injection attempt.

        Args:
            user_input (str): The user input to be checked for injection.
            max_heuristic_score (float, optional): The maximum heuristic score allowed. Defaults to 0.75.
            max_vector_score (float, optional): The maximum vector score allowed. Defaults to 0.90.
            max_model_score (float, optional): The maximum model (LLM) score allowed. Defaults to 0.90.
            check_heuristic (bool, optional): Whether to run the heuristic check. Defaults to True.
            check_vector (bool, optional): Whether to run the vector check. Defaults to True.
            check_llm (bool, optional): Whether to run the language model check. Defaults to True.

        Returns:
            RebuffDetectionResponse
        """

        injection_detected = False

        if check_heuristic:
            rebuff_heuristic_score = detect_prompt_injection_using_heuristic_on_input(
                user_input
            )

        else:
            rebuff_heuristic_score = 0

        if check_vector:
            self.initialize_pinecone()

            vector_score = detect_pi_using_vector_database(
                user_input, max_vector_score, self.vector_store
            )
            rebuff_vector_score = vector_score["top_score"]

        else:
            rebuff_vector_score = 0

        if check_llm:
            rendered_input = render_prompt_for_pi_detection(user_input)
            model_response = call_openai_to_detect_pi(
                rendered_input, self.openai_model, self.openai_apikey
            )

            rebuff_model_score = float(model_response.get("completion", 0))

        else:
            rebuff_model_score = 0

        if (
            rebuff_heuristic_score > max_heuristic_score
            or rebuff_model_score > max_model_score
            or rebuff_vector_score > max_vector_score
        ):
            injection_detected = True

        rebuff_response = RebuffDetectionResponse(
            heuristic_score=rebuff_heuristic_score,
            openai_score=rebuff_model_score,
            vector_score=rebuff_vector_score,
            run_heuristic_check=check_heuristic,
            run_language_model_check=check_llm,
            run_vector_check=check_vector,
            max_heuristic_score=max_heuristic_score,
            max_model_score=max_model_score,
            max_vector_score=max_vector_score,
            injection_detected=injection_detected,
        )
        return rebuff_response

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
        prompt: Union[str, PromptTemplate],
        canary_word: Optional[str] = None,
        canary_format: str = "<!-- {canary_word} -->",
    ) -> Tuple[Union[str, PromptTemplate], str]:
        """
        Adds a canary word to the given prompt which we will use to detect leakage.

        Args:
            prompt (Union[str, PromptTemplate]): The prompt to add the canary word to.
            canary_word (Optional[str], optional): The canary word to add. If not provided, a random canary word will be generated. Defaults to None.
            canary_format (str, optional): The format in which the canary word should be added. Defaults to "<!-- {canary_word} -->".

        Returns:
            Tuple[Union[str, PromptTemplate], str]: A tuple containing the modified prompt with the canary word and the canary word itself.
        """

        # Generate a canary word if not provided
        if canary_word is None:
            canary_word = self.generate_canary_word()

        # Embed the canary word in the specified format
        canary_comment = canary_format.format(canary_word=canary_word)

        if isinstance(prompt, str):
            prompt_with_canary: str = canary_comment + "\n" + prompt
            return prompt_with_canary, canary_word

        elif isinstance(prompt, PromptTemplate):
            prompt.template = canary_comment + "\n" + prompt.template
            return prompt, canary_word

        else:
            raise TypeError(
                f"prompt must be a langchain_core.prompts.PromptTemplate or a str, "
                f"but was {type(prompt)}"
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

    def log_leakage(self, user_input: str, completion: str, canary_word: str) -> None:
        """
        Logs the leakage of a canary word.

        Args:
            user_input (str): The user input.
            completion (str): The completion generated by the AI.
            canary_word (str): The leaked canary word.
        """

        if self.vector_store is None:
            self.initialize_pinecone()

        self.vector_store.add_texts(
            [user_input],
            metadatas=[{"completion": completion, "canary_word": canary_word}],
        )

        return None
