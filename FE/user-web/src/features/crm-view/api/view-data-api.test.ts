import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { getViewGroupData, getViewMainData } from "./view-data-api";
import { viewDataQueryKeys } from "./view-data-query-keys";
import type { ViewDataRequest, ViewMainResponse } from "../types/view-data";

vi.mock("@/lib/api-client", () => ({ apiClient: vi.fn() }));
const client = vi.mocked(apiClient);
const input: ViewDataRequest = { userId: "User", workspaceId: "Space/one", targetId: "Target", sourceType: "LIST", viewDefinitionId: "View/one", viewType: "TABLE", timeZone: "Asia/Seoul", q: "A & B", limit: 25 };
const response: ViewMainResponse = { state: "READY", part: "MAIN", viewType: "TABLE", viewDefinitionId: input.viewDefinitionId,
  viewName: "Work", source: { kind: "LIST", listDefinitionId: "Target", objectDefinitionId: null, itemKind: "LIST_ENTRY" },
  configurationFingerprint: "config", bindings: [], issues: [], summary: { sourceItemCount: 0, matchedItemCount: 0, eligibleItemCount: 0 },
  data: { presentation: {}, columnBindingIds: [], items: [], groups: [], pageInfo: { hasNextPage: false, nextCursor: null } } };

describe("View data HTTP and cache boundaries", () => {
  beforeEach(() => { client.mockReset().mockResolvedValue(response); });
  it("encodes only supported query fields and forwards cancellation", async () => {
    const signal = new AbortController().signal;
    await getViewMainData({ ...input, cursor: "next/+" }, signal);
    const [path, options] = client.mock.calls[0]!;
    const url = new URL(path, "http://localhost");
    expect(url.pathname).toBe("/api/users/me/workspaces/Space%2Fone/view-definitions/View%2Fone/data");
    expect(Object.fromEntries(url.searchParams)).toEqual({ sourceType: "LIST", part: "MAIN", limit: "25", q: "A & B", cursor: "next/+" });
    expect(options).toEqual({ signal });
  });
  it.each([
    { viewDefinitionId: "other" }, { viewType: "LIST" }, { part: "GROUP_ITEMS" },
    { source: { ...response.source, kind: "OBJECT" } }, { source: { ...response.source, listDefinitionId: "other" } },
  ])("rejects a response for another selection", async change => {
    client.mockResolvedValue({ ...response, ...change });
    await expect(getViewMainData(input, new AbortController().signal)).rejects.toThrow("mismatch");
  });
  it("preserves configuration guidance and API failures", async () => {
    client.mockResolvedValue({ ...response, state: "NEEDS_CONFIGURATION", bindings: [], summary: null, data: null });
    expect((await getViewMainData(input, new AbortController().signal)).state).toBe("NEEDS_CONFIGURATION");
    const failure = new Error("Unavailable"); client.mockRejectedValue(failure);
    await expect(getViewMainData(input, new AbortController().signal)).rejects.toBe(failure);
  });
  it("uses each Kanban column token without exposing an extra endpoint", async () => {
    client.mockResolvedValue({ ...response, viewType: "KANBAN", part: "GROUP_ITEMS", data: { groupKey: "one", groupToken: "opaque/+", items: [], pageInfo: { hasNextPage: false, nextCursor: null } } });
    await getViewGroupData({ ...input, viewType: "KANBAN", groupToken: "opaque/+" }, new AbortController().signal);
    expect(new URL(client.mock.calls[0]![0], "http://localhost").searchParams.get("groupToken")).toBe("opaque/+");
    await expect(getViewGroupData({ ...input, viewType: "KANBAN", groupToken: "other" }, new AbortController().signal)).rejects.toThrow("token mismatch");
  });
  it("isolates users, targets, sources, views, timezones, searches and groups", () => {
    const key = viewDataQueryKeys.main(input, "q", 25);
    for (const change of [{ userId: "other" }, { workspaceId: "other" }, { targetId: "other" }, { sourceType: "OBJECT" as const }, { viewDefinitionId: "other" }, { timeZone: "UTC" }])
      expect(viewDataQueryKeys.main({ ...input, ...change }, "q", 25)).not.toEqual(key);
    expect(viewDataQueryKeys.main({ ...input, userId: "USER", targetId: "TARGET" }, "q", 25)).toEqual(key);
    expect(viewDataQueryKeys.main(input, "other", 25)).not.toEqual(key);
    expect(viewDataQueryKeys.group(input, "one")).not.toEqual(viewDataQueryKeys.group(input, "two"));
  });
});
