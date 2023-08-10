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

### Pinecone (Vector DB)
* The pinecone index that you create must be of dimension 1536