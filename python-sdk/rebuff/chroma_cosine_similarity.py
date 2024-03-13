from langchain_community.vectorstores import Chroma
from typing import List, Tuple
from langchain_core.documents.base import Document


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
