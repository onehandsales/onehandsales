import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { createViewColumn, updateViewColumnLabel } from "./view-column-api";
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

describe("View column label API", () => {
  it.each(["예상 매출", null])("sends only labelOverride %s using the display setting ID", async labelOverride => {
    const response = { viewDefinitionId: "view", viewAttributeSettingDefinitionId: "column/one", labelOverride };
    vi.mocked(apiClient).mockResolvedValue(response);
    await expect(updateViewColumnLabel(scope, "column/one", labelOverride)).resolves.toEqual(response);
    expect(apiClient).toHaveBeenLastCalledWith("/api/users/me/workspaces/Workspace%2Fone/view-definitions/View/columns/column%2Fone", { method: "PATCH", body: JSON.stringify({ labelOverride }) });
  });
  it.each([{ viewDefinitionId: "foreign" }, { viewAttributeSettingDefinitionId: "foreign" }, { labelOverride: undefined }])("rejects mismatched or incomplete responses %j", async change => {
    vi.mocked(apiClient).mockResolvedValue({ viewDefinitionId: "view", viewAttributeSettingDefinitionId: "column", labelOverride: null, ...change });
    await expect(updateViewColumnLabel(scope, "column", null)).rejects.toThrow("mismatch");
  });
});
