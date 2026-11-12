import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { refreshViewColumnLabel } from "./refresh-view-column-label";
import { viewDataQueryKeys } from "./view-data-query-keys";
import { workspaceViewQueryKeys } from "./workspace-view-query-keys";
import type { ViewDataScope } from "../types/view-data";

describe("Refresh column label caches", () => {
  it("discards expired pages/tokens for all contexts of the originating View and preserves other scopes", async () => {
    const client = new QueryClient();
    const scope: ViewDataScope = { userId: "User", workspaceId: "Space", viewDefinitionId: "View", targetId: "object", sourceType: "OBJECT", viewType: "TABLE", timeZone: "Asia/Seoul" };
    const own = [viewDataQueryKeys.main(scope, "", 25), viewDataQueryKeys.main(scope, "검색", 25),
      viewDataQueryKeys.main({ ...scope, sourceType: "LIST", targetId: "list", timeZone: "UTC" }, "", 25)];
    const others = [viewDataQueryKeys.main({ ...scope, userId: "other" }, "", 25),
      viewDataQueryKeys.main({ ...scope, workspaceId: "other" }, "", 25), viewDataQueryKeys.main({ ...scope, viewDefinitionId: "other" }, "", 25)];
    const initial = { pages: [{ marker: "first" }, { marker: "second" }], pageParams: [undefined, "expired"] };
    for (const key of [...own, ...others]) client.setQueryData(key, initial);
    const settings = workspaceViewQueryKeys.menu("User", "Space", "View", "settings");
    client.setQueryData(settings, { marker: "settings" });
    const group = viewDataQueryKeys.group({ ...scope, q: "", limit: 25 }, "expired-group-token");
    client.setQueryData(group, initial);
    try {
      await refreshViewColumnLabel(client, scope);
      for (const key of own) {
        expect(client.getQueryData(key)).toEqual({ pages: [{ marker: "first" }], pageParams: [undefined] });
        expect(client.getQueryState(key)?.isInvalidated).toBe(true);
      }
      for (const key of others) {
        expect(client.getQueryData(key)).toEqual(initial);
        expect(client.getQueryState(key)?.isInvalidated).toBe(false);
      }
      expect(client.getQueryData(group)).toBeUndefined();
      expect(client.getQueryState(settings)?.isInvalidated).toBe(true);
    } finally { client.clear(); }
  });
});
