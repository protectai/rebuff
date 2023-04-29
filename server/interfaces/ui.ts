export interface stat {
  breaches: number;
  attempts: number;
}
export interface Stats {
  last24h: stat;
  last7d: stat;
  alltime: stat;
  loading: boolean;
}
