# Rebuff.AI

## Tooling

- Frontend:
  - [Next.js](https://github.com/vercel/next.js) - a React framework for production.
  - [Tailwind](https://tailwindcss.com/) for styling and layout.
  - [Supabase.js](https://supabase.com/docs/library/getting-started) for user management and realtime data syncing.
- Backend:
  - [app.supabase.com](https://app.supabase.com/): hosted Postgres database with restful API for usage with Supabase.js.

## Database Setup
In order to use the Rebuff server, you'll first need to:
1. Create relational database tables and functions to record user's credits and previous attempts
2. Create a vectorDB to record previous prompt embeddings for similarity searching

### Supabase (Relational DB)
* The needed relational database tables can be found in [sql_setup/tables](sql_setup/tables)
* The needed relational database functions can be found in [sql_setup/functions](sql_setup/functions)

### Vector DB

The vector DB can be either Pinecone or Chroma.

#### Pinecone
* The pinecone index that you create must be of dimension 1536.

#### Chroma
* To set up Chroma, follow the [deployment instructions](https://docs.trychroma.com/deployment).
* When you start the Rebuff server, you will need to set the following environment variables:
  * `CHROMA_URL`: The HTTP URL of the Chroma server (e.g. http://localhost:8000)
  * `CHROMA_COLLECTION_NAME`: The collection to use. This will be created if it does not exist.
  * `VECTOR_DB`: Set this to `chroma`.
* At the current time, authentication to the Chroma server is not supported, so make sure the server is adequately secured.
