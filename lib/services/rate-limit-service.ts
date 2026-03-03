type Bucket = {
  timestamps: number[];
};

declare global {
  var __rateLimitStore: Map<string, Bucket> | undefined;
}

const store = globalThis.__rateLimitStore ?? new Map<string, Bucket>();

if (!globalThis.__rateLimitStore) {
  globalThis.__rateLimitStore = store;
}

function prune(timestamps: number[], cutoff: number) {
  let index = 0;

  while (index < timestamps.length && timestamps[index] < cutoff) {
    index += 1;
  }

  if (index > 0) {
    timestamps.splice(0, index);
  }
}

export function consumeRateLimit(input: { key: string; limit: number; windowMs: number }) {
  const now = Date.now();
  const cutoff = now - input.windowMs;

  const bucket = store.get(input.key) ?? { timestamps: [] };
  prune(bucket.timestamps, cutoff);

  if (bucket.timestamps.length >= input.limit) {
    store.set(input.key, bucket);
    return {
      allowed: false as const,
    };
  }

  bucket.timestamps.push(now);
  store.set(input.key, bucket);

  return {
    allowed: true as const,
  };
}
