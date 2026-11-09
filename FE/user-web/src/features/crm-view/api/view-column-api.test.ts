import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { createViewColumn } from "./view-column-api";
import type { ViewDataScope } from "../types/view-data";

vi.mock("@/lib/api-client", () => ({ apiClient: vi.fn() }));
const scope: ViewDataScope = { userId: "User", workspaceId: "Workspace/one", viewDefinitionId: "View", targetId: "Object", sourceType: "OBJECT", viewType: "TABLE", timeZone: "Asia/Seoul" };
const input = { creationId: "creation", attributeDefinitionName: "매매가격", attributeType: "Currency" as const };
const result = { viewDefinitionId: "view", objectDefinitionId: "object", attributeDefinitionId: "attribute", viewAttributeSettingDefinitionId: "creation" };

describe("Table column API", () => {
  beforeEach(() => { vi.mocked(apiClient).mockReset().mockResolvedValue(result); });
  it("sends only the creation ID, name and type through the authenticated client", async () => {
    await expect(createViewColumn(scope, input)).resolves.toEqual(result);
    expect(apiClient).toHaveBeenCalledWith("/api/users/me/workspaces/Workspace%2Fone/view-definitions/View/columns", { method: "POST", body: JSON.stringify(input) });
  });
  it.each([{ viewDefinitionId: "foreign" }, { objectDefinitionId: "foreign" }, { viewAttributeSettingDefinitionId: "foreign" }, { attributeDefinitionId: "" }])("rejects mismatched identity: %j", async change => {
    vi.mocked(apiClient).mockResolvedValue({ ...result, ...change });
    await expect(createViewColumn(scope, input)).rejects.toThrow("mismatch");
  });
});
