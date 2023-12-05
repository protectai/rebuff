export interface ApiConfig {
  apiKey: string;
  apiUrl?: string;
}

export type VectorDbConfig = {
  pinecone: {
    apikey: string;
    environment: string;
    index: string;
  };
} | {
  chroma: {
    url: string;
    collectionName: string;
  };
};

export interface SdkConfig {
  vectorDB: VectorDbConfig
  openai: {
    apikey: string;
    model: string;
  };
};

export type RebuffConfig = ApiConfig | SdkConfig;
