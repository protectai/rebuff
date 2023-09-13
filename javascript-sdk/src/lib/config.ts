export interface ApiConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface SdkConfig {
  vectorStore: string;
  pinecone?: {
    apikey: string;
    environment: string;
    index: string;
  };
  supabase?: {
    serviceKey: string;
    url: string;
  };
  openai: {
    apikey: string;
    model: string;
  };
}

export type RebuffConfig = ApiConfig | SdkConfig;
