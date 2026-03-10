type CacheValue<T> = {
  expiresAt: number;
  value: T;
};

type InFlightValue<T> = {
  promise: Promise<T>;
};

type CacheEntry<T> = CacheValue<T> | InFlightValue<T>;

function isCacheValue<T>(entry: CacheEntry<T>): entry is CacheValue<T> {
  return "value" in entry;
}

function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

function logLiveDebug(message: string) {
  if (isDevelopment()) {
    console.info(`[GrassScan live] ${message}`);
  }
}

function wait(milliseconds: number) {
  if (milliseconds <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function createMemoryCache() {
  const store = new Map<string, CacheEntry<unknown>>();

  return {
    async getOrLoad<T>(
      key: string,
      ttlMs: number,
      loader: () => Promise<T>,
    ): Promise<T> {
      const now = Date.now();
      const entry = store.get(key) as CacheEntry<T> | undefined;

      if (entry && isCacheValue(entry) && entry.expiresAt > now) {
        logLiveDebug(`cache hit: ${key}`);
        return entry.value;
      }

      if (entry && !isCacheValue(entry)) {
        logLiveDebug(`cache join: ${key}`);
        return entry.promise;
      }

      logLiveDebug(`cache miss: ${key}`);

      const promise = loader()
        .then((value) => {
          store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
          });

          return value;
        })
        .catch((error) => {
          store.delete(key);
          throw error;
        });

      store.set(key, { promise });

      return promise;
    },
    clear() {
      store.clear();
    },
  };
}

const serverCache = createMemoryCache();
const REQUEST_GAP_MS = 1200;

let requestQueue = Promise.resolve();
let nextRequestAt = 0;

export async function withServerCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
) {
  return serverCache.getOrLoad(key, ttlMs, loader);
}

export async function enqueueMarketRequest<T>(
  label: string,
  task: () => Promise<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    requestQueue = requestQueue
      .catch(() => undefined)
      .then(async () => {
        const delay = Math.max(0, nextRequestAt - Date.now());

        if (delay > 0) {
          logLiveDebug(`throttle wait (${delay}ms): ${label}`);
          await wait(delay);
        }

        try {
          const result = await task();
          nextRequestAt = Date.now() + REQUEST_GAP_MS;
          resolve(result);
        } catch (error) {
          nextRequestAt = Date.now() + REQUEST_GAP_MS;
          reject(error);
        }
      });
  });
}

export function clearServerCache() {
  serverCache.clear();
  requestQueue = Promise.resolve();
  nextRequestAt = 0;
}

export function logLiveFetch(label: string) {
  logLiveDebug(`live api call: ${label}`);
}
