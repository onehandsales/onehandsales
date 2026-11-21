import { afterEach, expect, it, vi } from "vitest";
import { createArticleReader } from "./article-reader";

afterEach(() => vi.useRealTimers());
it("cancellation does not consume the next read failure, then the same query can retry", async () => {
  vi.useFakeTimers();
  const read = createArticleReader();
  const input = { category: "Start a business", query: "marketing", page: 1, scenario: "read-error", revision: 2 } as const;
  const cancelled = new AbortController();
  const first = read(input, cancelled.signal);
  const firstCheck = expect(first).rejects.toMatchObject({ name: "AbortError" });
  cancelled.abort(); await firstCheck;
  const failed = read(input, new AbortController().signal);
  const failureCheck = expect(failed).rejects.toThrow("could not be loaded");
  await vi.advanceTimersByTimeAsync(100); await failureCheck;
  const retry = read(input, new AbortController().signal);
  await vi.advanceTimersByTimeAsync(100);
  expect((await retry).items[0]?.id).toBe("how-to-start-a-digital-marketing-agency");
  expect(vi.getTimerCount()).toBe(0);
});
