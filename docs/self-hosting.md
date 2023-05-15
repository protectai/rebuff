# Self-hosting

### Self-hosting

To self-host Rebuff, you need to set up the necessary providers like Pinecone, Supabase, and OpenAI. Follow the links below to set up each provider:

* [Pinecone](https://www.pinecone.io/)
* [Supabase](https://supabase.io/)
* [OpenAI](https://beta.openai.com/signup/)

Once you have set up the providers, you can start the Rebuff server using Docker. First, build the Docker image:

```
docker build -t rebuff .
```

Then, start the Docker container with the following command, replacing the placeholders with your actual API keys and environment variables:

```
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=<your_openai_api_key> \
  -e BILLING_RATE_INT_10K=<your_billing_rate_int_10k> \
  -e MASTER_API_KEY=<your_master_api_key> \
  -e MASTER_CREDIT_AMOUNT=<your_master_credit_amount> \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_next_public_supabase_anon_key> \
  -e NEXT_PUBLIC_SUPABASE_URL=<your_next_public_supabase_url> \
  -e PINECONE_API_KEY=<your_pinecone_api_key> \
  -e PINECONE_ENVIRONMENT=<your_pinecone_environment> \
  -e PINECONE_INDEX_NAME=<your_pinecone_index_name> \
  -e SUPABASE_SERVICE_KEY=<your_supabase_service_key> \
  --name rebuff rebuff
```

Now, the Rebuff server should be running at `http://localhost:3000`.
