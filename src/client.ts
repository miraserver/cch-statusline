import fetch from 'node-fetch';
import type { GetUsersResponse } from './types.js';

interface CacheEntry {
  data: any;
  expiry: number;
}

export class CCHClient {
  private baseUrl: string;
  private apiKey: string;
  private cookie: string | null = null;
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTTL: number = 7000; // 7 seconds TTL

  constructor(baseUrl: string, apiKey: string, cacheTTL?: number) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    if (cacheTTL !== undefined) {
      this.cacheTTL = cacheTTL;
    }
  }

  /**
   * Authenticate and obtain session cookie
   * Note: auth-token cookie is simply the API key itself
   */
  async login(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: this.apiKey }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as any;

    if (!data.ok) {
      throw new Error(`Login failed: ${data.error || 'Unknown error'}`);
    }

    // The auth-token cookie is simply the API key
    this.cookie = `auth-token=${this.apiKey}`;
  }

  /**
   * Get user data including key statistics
   * This is the main method that replaces getOverviewData + getKeyLimitUsage
   */
  async getUserData(): Promise<GetUsersResponse['data']> {
    if (!this.cookie) {
      throw new Error('Not authenticated. Call login() first.');
    }

    const response = await fetch(`${this.baseUrl}/api/actions/users/getUsers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.cookie,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    const data = (await response.json()) as GetUsersResponse;

    if (!data.ok || !data.data) {
      throw new Error(`API error: ${data.error || 'Unknown error'}`);
    }

    return data.data;
  }

  /**
   * Get cached data or fetch fresh data
   */
  private async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(cacheKey, { data, expiry: Date.now() + this.cacheTTL });
    return data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get all statistics in one call (with caching)
   */
  async getStats() {
    const cacheKey = `stats-${this.apiKey}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      const userData = await this.getUserData();

      if (!userData || userData.length === 0) {
        throw new Error('No user data available');
      }

      const user = userData[0];

      // Find our key by matching the API key
      const ourKey = user.keys.find(k => k.fullKey === this.apiKey);

      if (!ourKey) {
        throw new Error('Key not found in user data');
      }

      // Extract the model with highest cost (likely the most recently used expensive model)
      // This gives priority to models like Sonnet over Haiku
      const lastUsedModel = ourKey.modelStats.length > 0
        ? ourKey.modelStats.reduce((prev, current) =>
            current.totalCost > prev.totalCost ? current : prev
          ).model
        : null;

      return {
        // Today's metrics
        todayCost: ourKey.todayUsage,
        todayRequests: ourKey.todayCallCount,
        dailyQuota: user.dailyQuota,
        avgResponseTime: 0, // Not available from this endpoint

        // Limits (from key configuration)
        cost5h: 0, // Not available - would need Redis
        limit5h: ourKey.limit5hUsd,
        costWeekly: 0, // Not available - would need Redis
        limitWeekly: ourKey.limitWeeklyUsd,
        costMonthly: 0, // Not available - would need Redis
        limitMonthly: ourKey.limitMonthlyUsd,
        concurrentSessions: 0, // Not available - would need Redis
        limitConcurrentSessions: ourKey.limitConcurrentSessions,

        // Additional data
        lastProviderName: ourKey.lastProviderName,
        lastUsedModel: lastUsedModel,
        modelStats: ourKey.modelStats,
      };
    });
  }
}
