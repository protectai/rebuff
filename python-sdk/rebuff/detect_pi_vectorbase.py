from typing import Dict, Union
from langchain.vectorstores.pinecone import Pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
import pinecone


# https://api.python.langchain.com/en/latest/vectorstores/langchain.vectorstores.pinecone.Pinecone.html
def detect_pi_using_vector_database(
    input: str, similarity_threshold: float, vector_store: Pinecone
) -> Dict:
    """
    Detects Prompt Injection using similarity search with vector database.

    Args:
        input (str): user input to be checked for prompt injection
        similarity_threshold (float): The threshold for similarity between entries in vector database and the user input.
        vector_store (Pinecone): Vector database of prompt injections

    Returns:
        Dict (str, Union[float, int]): top_score (float) that contains the highest score wrt similarity between vector database and the user input.
                                        count_over_max_vector_score (int) holds the count for times the similarity score (between vector database and the user input)
                                        came out more than the top_score and similarty_threshold.
    """
    try:
        top_k = 20
        results = vector_store.similarity_search_with_score(input, top_k)

        top_score = 0
        count_over_max_vector_score = 0

        for _, score in results:
            if score is None:
                continue

            if score > top_score:
                top_score = score

            if score >= similarity_threshold and score > top_score:
                count_over_max_vector_score += 1

        vector_score = {
            "top_score": top_score,
            "count_over_max_vector_score": count_over_max_vector_score,
        }

        return vector_score

    except Exception as error:
        raise Exception(error)


def init_pinecone(
    environment: str, api_key: str, index: str, openai_api_key: str
) -> Pinecone:
    """
    Initializes connection with the Pinecone vector database using existing (rebuff) index.

    Args:
        environment (str): Pinecone environment
        api_key (str): Pinecone API key
        index (str): Pinecone index name
        openai_api_key: Open AI API key

    Returns:
        vector_store (Pinecone)

    """
    if not environment:
        raise ValueError("Pinecone environment definition missing")
    if not api_key:
        raise ValueError("Pinecone apikey definition missing")

    try:
        pinecone.init(api_key=api_key, environment=environment)

        openai_embeddings = OpenAIEmbeddings(
            openai_api_key=openai_api_key, model="text-embedding-ada-002"
        )

        vector_store = Pinecone.from_existing_index(index, openai_embeddings)

        return vector_store

    except Exception as error:
        raise Exception(error)
