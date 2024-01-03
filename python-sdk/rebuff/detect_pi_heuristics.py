import re
from difflib import SequenceMatcher
from typing import List


def generate_injection_keywords() -> List[str]:
    """
    Generate all possible combinations of sentences based on a list of predefined verbs, adjectives, prepositions, and objects that can be used for prompt injection.

    Args:
        None

    Returns:
        List of sentences
    """
    verbs = [
        "Ignore",
        "Disregard",
        "Skip",
        "Forget",
        "Neglect",
        "Overlook",
        "Omit",
        "Bypass",
        "Pay no attention to",
        "Do not follow",
        "Do not obey",
    ]

    adjectives = [
        "",
        "prior",
        "previous",
        "preceding",
        "above",
        "foregoing",
        "earlier",
        "initial",
    ]

    prepositions = [
        "",
        "and start over",
        "and start anew",
        "and begin afresh",
        "and start from scratch",
    ]

    objects = [
        "content",
        "text",
        "instructions",
        "instruction",
        "directives",
        "directive",
        "commands",
        "command",
        "context",
        "conversation",
        "input",
        "inputs",
        "data",
        "message",
        "messages",
        "communication",
        "response",
        "responses",
        "request",
        "requests",
    ]

    # Generate all possible combinations of sentences
    injection_keywords = []
    for verb in verbs:
        for adjective in adjectives:
            for object in objects:
                for preposition in prepositions:
                    all_words = (
                        verb + " " + adjective + " " + object + " " + preposition
                    )
                    injection_keywords.append(all_words)

    return injection_keywords


def normalize_string(input_string: str) -> str:
    """
    Normalized input string by converting to lower case, remove characters that are not letters, remove excession white space etc.

    Args:
        input_string (str): String to be normalized

    Returns:
        normalized_string (str)
    """

    # Convert to lowercase
    result = input_string.lower()

    # Remove characters that are not letters, digits, spaces, or underscores
    result = re.sub(r"[^\w\s]|_", "", result)

    # Replace multiple consecutive spaces with a single space
    result = re.sub(r"\s+", " ", result)

    # Trim leading and trailing spaces
    normalized_string = result.strip()

    return normalized_string


def get_input_substrings(normalized_input: str, keyword_length: int) -> List[str]:
    """
    Iterate over the input string and get substrings which have same length as as the keywords string

    Args:
        normalized_input (str): Normalized input string
        keyword_length (int): The number of words in the injection string

    Returns:
        List of input substrings that have the same length as the number of keywords in injection string
    """
    words_in_input_string = normalized_input.split(" ")
    input_substrings = []
    number_of_substrings = len(words_in_input_string) - keyword_length + 1
    for i in range(number_of_substrings):
        input_substrings.append(" ".join(words_in_input_string[i : i + keyword_length]))

    return input_substrings


def get_matched_words_score(
    substring: str, keyword_parts: List[str], max_matched_words: int
) -> float:
    matched_words_count = len(
        [part for part, word in zip(keyword_parts, substring.split()) if word == part]
    )

    if matched_words_count > 0:
        base_score = 0.5 + 0.5 * min(matched_words_count / max_matched_words, 1)
    else:
        base_score = 0

    return base_score


def detect_prompt_injection_using_heuristic_on_input(input: str) -> float:
    highest_score = 0
    max_matched_words = 5

    all_injection_keywords_strings = generate_injection_keywords()
    normalized_input_string = normalize_string(input)

    for keyword_string in all_injection_keywords_strings:
        normalized_keyword_string = normalize_string(keyword_string)
        keywords = normalized_keyword_string.split(" ")
        # Generate substrings of similar length (to keyword length) in the input string
        input_substrings = get_input_substrings(normalized_input_string, len(keywords))

        # Calculate the similarity score between the keywords and each substring
        for substring in input_substrings:
            similarity_score = SequenceMatcher(
                None, substring, normalized_keyword_string
            ).ratio()

            matched_word_score = get_matched_words_score(
                substring, keywords, max_matched_words
            )

            # Adjust the score using the similarity score
            adjusted_score = matched_word_score - similarity_score * (
                1 / (max_matched_words * 2)
            )

            if adjusted_score > highest_score:
                highest_score = adjusted_score

    return highest_score
