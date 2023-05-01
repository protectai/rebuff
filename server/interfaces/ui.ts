import { DetectApiSuccessResponse } from "./api";

interface stat {
  breaches: number;
  attempts: number;
}
export interface GlobalStats {
  last24h: stat;
  last7d: stat;
  alltime: stat;
}

export interface AppState {
  apikey: string;
  credits: {
    total: number;
    used: number;
  };
  attempts: DetectApiSuccessResponse[];
  stats: GlobalStats;
}
