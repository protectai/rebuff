from typing import Dict, Union
from langchain.vectorstores.pinecone import Pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
import pinecone


# https://api.python.langchain.com/en/latest/vectorstores/langchain.vectorstores.pinecone.Pinecone.html
def detect_pi_using_vector_database(
    input: str, similarity_threshold: float, vector_store: Pinecone
) -> Union[Dict[str, int], str]:
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
            "error": None,
        }

        return vector_score

    except Exception as error:
        vector_score = {
            "top_score": None,
            "count_over_max_vector_score": None,
            "error": error,
        }

        return vector_score


def init_pinecone(
    environment: str, api_key: str, index: str, openai_api_key: str
) -> Union[Pinecone, str]:
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

        return {"vector_store": vector_store, "error": None}

    except Exception as error:
        return {"vector_store": None, "error": error}
