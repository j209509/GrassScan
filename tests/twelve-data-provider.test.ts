import assert from "node:assert/strict";
import test from "node:test";
import { RATE_LIMIT_NOTICE, isTwelveDataRateLimitError } from "@/lib/market/providers/twelve-data-provider";

test("rate limit helper detects English provider errors without leaking them into UI copy", () => {
  assert.equal(RATE_LIMIT_NOTICE, "API制限のため、一部データをデモ表示しています。");
  assert.equal(
    isTwelveDataRateLimitError(new Error("API credits exhausted for this minute")),
    true,
  );
});

test("rate limit helper does not classify unrelated errors as rate limits", () => {
  assert.equal(
    isTwelveDataRateLimitError(new Error("Unauthorized API key")),
    false,
  );
});
