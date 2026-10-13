import type { BirdeyeCandle, BirdeyeTokenMetadata } from "./types";
import { createHash } from "node:crypto";
import { UsageMeter, type ApiUsage } from "./usage";

type QueryValue = string | number | boolean | undefined;

class Gate {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly limit: number) {}

  async run<T>(job: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
    this.active += 1;
    try {
      return await job();
    } finally {
      this.active -= 1;
      this.waiting.shift()?.();
    }
  }
}

export class BirdeyeError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
  }
}

export class BirdeyeClient {
  private static readonly responseCache = new Map<
    string,
    { expiresAt: number; value: Promise<unknown> }
  >();
  private readonly baseUrl: string;
  private readonly retries: number;
  private readonly timeoutMs: number;
  private readonly gate: Gate;
  private readonly meter = new UsageMeter();
  /** Cache partition: responses fetched with one key are never served to another. */
  private readonly keyTag: string;

  constructor(private readonly apiKey: string) {
    if (!apiKey) throw new Error("BIRDEYE_API_KEY is required");
    this.keyTag = createHash("sha256").update(apiKey).digest("hex").slice(0, 12);
    this.baseUrl = process.env.BIRDEYE_BASE_URL ?? "https://public-api.birdeye.so";
    this.retries = Number(process.env.BIRDEYE_MAX_RETRIES ?? 4);
    this.timeoutMs = Number(process.env.BIRDEYE_TIMEOUT_MS ?? 20_000);
    this.gate = new Gate(Math.max(1, Number(process.env.BIRDEYE_CONCURRENCY ?? 12)));
  }

  private url(path: string, query: Record<string, QueryValue> = {}): URL {
    const url = new URL(path, this.baseUrl);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return url;
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    options: { query?: Record<string, QueryValue>; body?: unknown } = {},
  ): Promise<T> {
    const url = this.url(path, options.query);
    const cacheKey = `${this.keyTag}:${method}:${url.toString()}:${JSON.stringify(options.body ?? null)}`;
    const now = Date.now();
    const cached = BirdeyeClient.responseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      this.meter.hit();
      return cached.value as Promise<T>;
    }

    const value = this.gate.run(async () => {
      let last: unknown;
      for (let attempt = 0; attempt <= this.retries; attempt += 1) {
        try {
          const response = await fetch(url, {
            method,
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "x-api-key": this.apiKey,
              "x-chain": "solana",
            },
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
            cache: "no-store",
            signal: AbortSignal.timeout(this.timeoutMs),
          });

          if (response.ok) {
            const json = (await response.json()) as T;
            this.meter.record(path, url.searchParams, options.body, json);
            return json;
          }

          const detail = await response.text();
          const error = new BirdeyeError(
            `Birdeye ${response.status}: ${detail.slice(0, 300)}`,
            response.status,
            path,
          );
          if (response.status !== 429 && response.status < 500) throw error;
          last = error;

          const retryAfter = Number(response.headers.get("retry-after") ?? 0);
          const delay = retryAfter > 0 ? retryAfter * 1_000 : 300 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (error) {
          last = error;
          if (error instanceof BirdeyeError && error.status < 500 && error.status !== 429) {
            throw error;
          }
          if (attempt === this.retries) break;
          await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
        }
      }
      throw last instanceof Error ? last : new Error(`Birdeye request failed: ${path}`);
    });
    const ttlMs = Math.max(0, Number(process.env.CACHE_TTL_SECONDS ?? 300)) * 1_000;
    BirdeyeClient.responseCache.set(cacheKey, { expiresAt: now + ttlMs, value });
    try {
      return await value;
    } catch (error) {
      if (BirdeyeClient.responseCache.get(cacheKey)?.value === value) {
        BirdeyeClient.responseCache.delete(cacheKey);
      }
      throw error;
    }
  }

  /** Requests and compute units spent by this client instance. */
  usage(): ApiUsage {
    return this.meter.snapshot();
  }

  async tokenMetadata(mint: string): Promise<BirdeyeTokenMetadata | null> {
    const response = await this.request<{
      success?: boolean;
      data?: BirdeyeTokenMetadata;
    }>("GET", "/defi/v3/token/meta-data/single", { query: { address: mint } });
    return response.data ?? null;
  }

  /** Supply and market cap; the video derives entry market cap from it. */
  async tokenMarketData(mint: string): Promise<{ circulatingSupply: number; marketCapUsd: number; holders: number } | null> {
    const response = await this.request<{
      data?: { circulating_supply?: number; market_cap?: number; holder?: number };
    }>("GET", "/defi/v3/token/market-data", { query: { address: mint } });
    const data = response.data;
    if (!data) return null;
    return {
      circulatingSupply: Number(data.circulating_supply) || 0,
      marketCapUsd: Number(data.market_cap) || 0,
      holders: Number(data.holder) || 0,
    };
  }

  /** Birdeye's label for an address; empty for most wallets. */
  async walletIdentity(wallet: string): Promise<unknown> {
    return this.request("GET", "/identity/v1/single", { query: { address: wallet } });
  }

  /** Tagged-wallet flow per bucket: dev, sniper, smart_trader and kol series. */
  async walletTagsTracker(mint: string, from: number, to: number, timeFrame: string, tags: readonly string[]): Promise<unknown> {
    return this.request("GET", "/token/v1/wallet-tags-tracker", {
      query: { token_address: mint, time_from: from, time_to: to, time_frame: timeFrame, tags: tags.join(",") },
    });
  }

  /** The tagged wallets behind each bucket, biggest first. */
  async walletTagsDetails(mint: string, from: number, to: number, timeFrame: string, tags: readonly string[], limitWallet = 3, limitBucket = 300): Promise<unknown> {
    return this.request("GET", "/token/v1/wallet-tags-tracker/details", {
      query: { token_address: mint, time_from: from, time_to: to, time_frame: timeFrame, tags: tags.join(","), limit_wallet: limitWallet, limit_bucket: limitBucket },
    });
  }

  /** Swaps at or above a USD size, oldest first. */
  async tradesByVolume(mint: string, from: number, to: number, minUsd: number, limit = 100, offset = 0): Promise<unknown> {
    return this.request("GET", "/defi/v3/token/txs-by-volume", {
      query: {
        token_address: mint,
        volume_type: "usd",
        min_volume: Math.round(minUsd),
        after_time: from,
        before_time: to,
        tx_type: "swap",
        sort_by: "block_unix_time",
        sort_type: "asc",
        limit,
        offset,
      },
    });
  }

  async tokenPrice(mint: string): Promise<number> {
    const response = await this.request<{
      success?: boolean;
      data?: { value?: number | string };
    }>("GET", "/defi/price", { query: { address: mint } });
    const value = Number(response.data?.value);
    return Number.isFinite(value) ? value : 0;
  }

  async ohlcv(
    mint: string,
    from: number,
    to: number,
    type = "1H",
  ): Promise<BirdeyeCandle[]> {
    const response = await this.request<{
      success?: boolean;
      data?: { items?: Array<Omit<BirdeyeCandle, "unixTime"> & { unix_time: number }> };
    }>("GET", "/defi/v3/ohlcv", {
      query: {
        address: mint,
        type,
        time_from: from,
        time_to: to,
        mode: "range",
        padding: false,
      },
    });
    return (response.data?.items ?? []).map(({ unix_time, ...item }) => ({
      ...item,
      unixTime: unix_time,
    }));
  }
}
