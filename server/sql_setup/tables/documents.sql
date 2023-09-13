-- Only necessary if using Supabase as the vector store

-- Enable the pgvector extension to work with embedding vectors
create extension vector;

create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536)
);