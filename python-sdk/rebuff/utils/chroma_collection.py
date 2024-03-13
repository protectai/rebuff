import os
import uuid
from datasets import load_dataset
import chromadb
from chromadb.config import Settings
import time
import chromadb.utils.embedding_functions as embedding_functions

openai_embedding_function = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.environ.get("OPENAI_API_KEY"), model_name="text-embedding-ada-002"
)

chroma_client = chromadb.HttpClient(
    host="chroma",
    port=8000,
    settings=Settings(allow_reset=True, anonymized_telemetry=False),
)


rebuff_collection_name = "rebuff"

dataset = load_dataset("Lakera/gandalf_ignore_instructions")
documents = dataset["train"]["text"][:200]

metadatas = [{"source": "Rebuff"}] * len(documents)
documents_ids = [str(uuid.uuid1()) for i in range(1, len(documents) + 1)]

collection_status = False
count = 0
while not collection_status and count <= 5:
    count += 1
    try:
        chroma_collections = [
            collection for collection in chroma_client.list_collections()
        ]
        if chroma_collections:
            chroma_collections_names = [
                collection.name for collection in chroma_collections
            ]

            if rebuff_collection_name in chroma_collections_names:
                document_collection = chroma_client.get_collection(
                    name=rebuff_collection_name,
                    embedding_function=openai_embedding_function,
                )

            else:
                document_collection = chroma_client.create_collection(
                    name=rebuff_collection_name,
                    metadata={"hnsw:space": "cosine"},
                    embedding_function=openai_embedding_function,
                )

                document_collection.add(
                    documents=documents, metadatas=metadatas, ids=documents_ids
                )

        else:
            document_collection = chroma_client.create_collection(
                name=rebuff_collection_name,
                metadata={"hnsw:space": "cosine"},
                embedding_function=openai_embedding_function,
            )

            document_collection.add(
                documents=documents, metadatas=metadatas, ids=documents_ids
            )
        collection_status = True
    except Exception as e:
        pass

# Wait for the documents to be added to the collection
count = 0
while document_collection.count() == 0 and count < 5:
    count += 1
    time.sleep(10)
