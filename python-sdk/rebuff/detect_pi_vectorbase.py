from typing import Dict, List, Tuple, Union, Optional

import pinecone
from langchain.vectorstores.pinecone import Pinecone
from langchain_community.vectorstores import Chroma
from langchain_core.documents.base import Document
from langchain_openai import OpenAIEmbeddings

try:
    import chromadb

    chromadb_installed = True
except ImportError:
    print(
        "To use Chromadb, please install rebuff with rebuff extras. 'pip install \"rebuff[chromadb]\"'"
    )
    chromadb_installed = False


def detect_pi_using_vector_database(
    input: str,
    similarity_threshold: float,
    vector_store: Union[Pinecone, Optional[Chroma]],
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

    pc = pinecone.Pinecone(api_key=api_key)
    pc_index = pc.Index(index)

    openai_embeddings = OpenAIEmbeddings(
        openai_api_key=openai_api_key, model="text-embedding-ada-002"
    )

    vector_store = Pinecone(pc_index, openai_embeddings, text_key="input")

    return vector_store


if chromadb_installed:

    class ChromaCosineSimilarity(Chroma):
        """
        Our code expects a similarity score where similar vectors are close to 1, but Chroma returns a distance score
        where similar vectors are close to 0.
        """

        def similarity_search_with_score(
            self, query: str, k: int, filter=None
        ) -> List[Tuple[Document, float]]:
            """
            Detects Prompt Injection using similarity search with Chroma database.

            Args:
                query (str): user input to be checked for prompt injection
                k (int): The threshold for similarity between entries in vector database and the user input.

            Returns:
                List[Tuple[Document, float]]:  Documents with most similarity with the query and the correspoding similarity scores.
            """

            results = super().similarity_search_with_score(query, k, filter)
            return [(document, 1 - score) for document, score in results]

    def init_chroma(
        url: str, collection_name: str, openai_api_key: str
    ) -> ChromaCosineSimilarity:
        """
        Initializes Chroma vector database.

        Args:
            url: str, Chroma URL
            collection_name: str, Chroma collection name
            openai_api_key (str): Open AI API key
        Returns:
            vector_store (ChromaCosineSimilarity)

        """
        if not url:
            raise ValueError("Chroma url definition missing")
        if not collection_name:
            raise ValueError("Chroma collection name definition missing")

        openai_embeddings = OpenAIEmbeddings(
            openai_api_key=openai_api_key, model="text-embedding-ada-002"
        )

        chroma_collection = ChromaCosineSimilarity(
            client=chromadb.Client(),
            collection_name=collection_name,
            embedding_function=openai_embeddings,
        )
        return chroma_collection
