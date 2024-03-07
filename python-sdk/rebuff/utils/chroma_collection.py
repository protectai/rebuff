import os
import uuid
import chromadb
from chromadb.config import Settings
import chromadb.utils.embedding_functions as embedding_functions

openai_embedding_function = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.environ.get("OPENAI_API_KEY"), model_name="text-embedding-ada-002"
)

chroma_client = chromadb.HttpClient(
    host="chroma",
    port=8000,
    settings=Settings(allow_reset=True, anonymized_telemetry=False),
)

documents_file_path = "rebuff/utils/documents.txt"

with open(documents_file_path, "r") as file:
    documents = [line.strip() for line in file]

metadatas = [{"source": "Rebuff"}] * len(documents)
documents_ids = [str(uuid.uuid1()) for i in range(1, len(documents) + 1)]


document_collection = chroma_client.create_collection(
    name="rebuff",
    metadata={"hnsw:space": "cosine"},
    embedding_function=openai_embedding_function,
)

document_collection.add(documents=documents, metadatas=metadatas, ids=documents_ids)
