export interface ApiConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface SdkConfig {
  pinecone: {
    apikey: string;
    environment: string;
    index: string;
  };
  openai: {
    apikey: string;
    model: string;
  };
}

export type RebuffConfig = ApiConfig | SdkConfig;
