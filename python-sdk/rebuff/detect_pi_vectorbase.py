from typing import Any, Dict
import pinecone
from langchain.vectorstores.pinecone import Pinecone
from langchain_community.vectorstores import VectorStore
from langchain_openai import OpenAIEmbeddings

from chromadb.config import Settings


def detect_pi_using_vector_database(
    input: str,
    similarity_threshold: float,
    vector_store: VectorStore,
) -> Dict:
    """
    Detects Prompt Injection using similarity search with vector database.

    Args:
        input (str): user input to be checked for prompt injection
        similarity_threshold (float): The threshold for similarity between entries in vector database and the user input.
        vector_store (Pinecone or Chroma): Vector database of prompt injections

    Returns:
        Dict (str, Union[float, int]): top_score (float) that contains the highest score wrt similarity between vector database and the user input.
                                        count_over_max_vector_score (int) holds the count for times the similarity score (between vector database and the user input)
                                        came out more than the top_score and similarty_threshold.
    """

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


def init_pinecone(api_key: str, index: str, openai_api_key: str) -> Pinecone:
    """
    Initializes connection with the Pinecone vector database using existing (rebuff) index.

    Args:
        api_key (str): Pinecone API key
        index (str): Pinecone index name
        openai_api_key (str): Open AI API key

    Returns:
        vector_store (Pinecone)

    """
    if not api_key:
        raise ValueError("Pinecone apikey definition missing")

    if not index:
        raise ValueError("Pinecone index definition missing")

    pc = pinecone.Pinecone(api_key=api_key)
    pc_index = pc.Index(index)

    openai_embeddings = OpenAIEmbeddings(
        openai_api_key=openai_api_key, model="text-embedding-ada-002"
    )

    vector_store = Pinecone(pc_index, openai_embeddings, text_key="input")

    return vector_store


def init_chroma(collection_name: str, openai_api_key: str) -> Any:
    """
    Initializes Chroma vector database.

    Args:
        collection_name: str, Chroma collection name
        openai_api_key (str): Open AI API key
    Returns:
        vector_store (ChromaCosineSimilarity)

    """

    try:
        import chromadb
        from rebuff.chroma_cosine_similarity import ChromaCosineSimilarity

    except ImportError:
        print(
            "To use Chromadb, please install rebuff with rebuff extras. 'pip install \"rebuff[chromadb]\"'"
        )

    openai_embeddings = OpenAIEmbeddings(
        openai_api_key=openai_api_key, model="text-embedding-ada-002"
    )

    client = chromadb.HttpClient(
        host="localhost",
        port=8000,
        settings=Settings(allow_reset=True, anonymized_telemetry=False),
    )

    chroma_collection = ChromaCosineSimilarity(
        client=client, collection_name="rebuff", embedding_function=openai_embeddings
    )

    return chroma_collection
