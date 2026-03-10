import assert from "node:assert/strict";
import test from "node:test";
import { createMemoryCache } from "@/lib/market/server-cache";

test("memory cache reuses the resolved value within the ttl window", async () => {
  const cache = createMemoryCache();
  let callCount = 0;

  const loader = async () => {
    callCount += 1;
    return {
      value: `snapshot-${callCount}`,
    };
  };

  const first = await cache.getOrLoad("overview", 5_000, loader);
  const second = await cache.getOrLoad("overview", 5_000, loader);

  assert.equal(callCount, 1);
  assert.equal(first.value, "snapshot-1");
  assert.equal(second.value, "snapshot-1");
});

test("memory cache shares the in-flight promise for concurrent callers", async () => {
  const cache = createMemoryCache();
  let callCount = 0;

  const loader = async () => {
    callCount += 1;
    await new Promise((resolve) => {
      setTimeout(resolve, 25);
    });

    return callCount;
  };

  const [first, second] = await Promise.all([
    cache.getOrLoad("quote:BBAI", 5_000, loader),
    cache.getOrLoad("quote:BBAI", 5_000, loader),
  ]);

  assert.equal(callCount, 1);
  assert.equal(first, 1);
  assert.equal(second, 1);
});
