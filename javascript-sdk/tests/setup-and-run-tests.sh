#!/usr/bin/env bash

set -e # Exit with nonzero exit code if anything fails
set -x

echo "Starting chroma server..."
docker pull chromadb/chroma
docker stop chroma || true
docker rm chroma || true
docker run -d -p 8000:8000 --name chroma chromadb/chroma

echo "Waiting for Chroma server to start..."
npx ts-node tests/wait-for-chroma.ts

echo "Inserting Chroma test vectors..."
npx ts-node tests/insert-chroma-vectors.ts

echo "Running tests..."
npx mocha --require ts-node/register tests/**/*.test.ts
