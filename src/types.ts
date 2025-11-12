export interface AuthResponse {
  ok: boolean;
  data?: {
    user: {
      id: number;
      name: string;
      role: string;
    };
    key: {
      id: number;
      name: string;
    };
  };
  error?: string;
}

export interface OverviewData {
  ok: boolean;
  data?: {
    concurrentSessions: number;
    todayRequests: number;
    todayCost: number;
    avgResponseTime: number;
  };
  error?: string;
}

export interface KeyLimitUsage {
  ok: boolean;
  data?: {
    cost5h: {
      current: number;
      limit: number | null;
      resetAt?: string;
    };
    costWeekly: {
      current: number;
      limit: number | null;
      resetAt?: string;
    };
    costMonthly: {
      current: number;
      limit: number | null;
      resetAt?: string;
    };
    concurrentSessions: {
      current: number;
      limit: number;
    };
  };
  error?: string;
}

export interface StatsOutput {
  todayCost: number;
  todayRequests: number;
  dailyQuota: number | null;
  cost5h: number;
  limit5h: number | null;
  costWeekly: number;
  limitWeekly: number | null;
  costMonthly: number;
  limitMonthly: number | null;
  concurrentSessions: number;
  limitConcurrentSessions: number;
  avgResponseTime: number;
  lastProviderName: string | null;
  lastUsedModel: string | null;
  modelStats: Array<{
    model: string;
    callCount: number;
    totalCost: number;
  }>;
}

export interface GetUsersResponse {
  ok: boolean;
  data?: Array<{
    id: number;
    name: string;
    role: string;
    rpm: number;
    dailyQuota: number;
    providerGroup: string | null;
    keys: Array<{
      id: number;
      name: string;
      fullKey?: string;
      todayUsage: number;
      todayCallCount: number;
      lastUsedAt: Date | null;
      lastProviderName: string | null;
      modelStats: Array<{
        model: string;
        callCount: number;
        totalCost: number;
      }>;
      limit5hUsd: number | null;
      limitWeeklyUsd: number | null;
      limitMonthlyUsd: number | null;
      limitConcurrentSessions: number;
    }>;
  }>;
  error?: string;
}
