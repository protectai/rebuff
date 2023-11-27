#!/usr/bin/env bash

set -e # Exit with nonzero exit code if anything fails

echo "Starting chroma server..."
export CHROMA_URL=http://localhost:8000
export CHROMA_COLLECTION_NAME=javascript_tests
docker pull chromadb/chroma
docker stop chroma || true
docker rm chroma || true
docker run -d -p 8000:8000 --name chroma chromadb/chroma

echo "Waiting for Chroma server to start..."
ts-node tests/wait-for-chroma.ts

echo "Inserting Chroma test vectors..."
ts-node tests/insert-chroma-vectors.ts

echo "Running tests..."
mocha --require ts-node/register tests/**/*.test.ts
