// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createClientStore } from "./create-client-store";
// 기능 : 각 검사의 저장소·workspace 문맥을 독립적으로 준비한다.
function setup() {
  const runtime = createPreviewRuntime(); const store = createClientStore(runtime); store.connect(); runtime.setSession("preview-a");
  const state = runtime.getSnapshot(); const scope = { actorId: state.session!.id, workspaceId: state.workspaceId!, revision: state.revision };
  return { runtime, store, scope, clientId: "studio-a:client-doe", fieldId: "studio-a:client-field-extra" };
}
// 기능 : 각 요청에 별개의 취소 신호를 제공한다.
function signal() { return new AbortController().signal; }
describe("G20 field definitions, values and local images", () => {
  it("keeps definition counts, primary email and values for different clients separate; rename retains IDs and deletion removes only its values", async () => {
    const { store, scope, clientId, fieldId } = setup();
    await store.edit(scope, { kind: "add-field", id: fieldId, name: "Email" }, signal());
    await store.edit(scope, { kind: "add-field", id: fieldId, name: "Email" }, signal());
    await expect(store.edit(scope, { kind: "add-field", id: fieldId + "-other", name: " email " }, signal())).rejects.toThrow("already exists");
    await expect(store.edit(scope, { kind: "add-field", id: fieldId + "-empty", name: " " }, signal())).rejects.toThrow("field name");
    await store.edit(scope, { kind: "field-value", clientId, fieldId, fieldRevision: 0, revision: 0, value: "custom-value" }, signal());
    const data = await store.read(scope, signal()); expect(data.fields).toHaveLength(4); expect(data.contacts[0]!.email).toBe("janesmith1.mobbin@gmail.com"); expect(data.fieldValues).toEqual([{ clientId, fieldId, value: "custom-value", revision: 1 }]);
    await store.edit(scope, { kind: "rename-field", id: fieldId, revision: 0, name: "Contact note" }, signal());
    expect((await store.read(scope, signal())).fieldValues[0]!.value).toBe("custom-value");
    await store.edit(scope, { kind: "delete-field", id: fieldId, revision: 1 }, signal());
    expect((await store.read(scope, signal())).fieldValues).toEqual([]);
    await expect(store.edit(scope, { kind: "field-value", clientId, fieldId, fieldRevision: 1, revision: 1, value: "late" }, signal())).rejects.toThrow("removed");
    await expect(store.edit(scope, { kind: "add-field", id: fieldId, name: "Email" }, signal())).rejects.toThrow("removed");
  });
  it("rejects stale value and image revisions without overwriting independent edits", async () => {
    const { store, scope, clientId } = setup(); const fieldId = "studio-a:client-field-1";
    await store.edit(scope, { kind: "field-value", clientId, fieldId, fieldRevision: 0, revision: 0, value: "Phone" }, signal());
    const image = { file: new Blob(["local-image"], { type: "image/png" }), name: "sample.png" };
    await store.edit(scope, { kind: "image", clientId, revision: 0, image }, signal());
    await expect(store.edit(scope, { kind: "field-value", clientId, fieldId, fieldRevision: 0, revision: 0, value: "old" }, signal())).rejects.toThrow("changed");
    await expect(store.edit(scope, { kind: "image", clientId, revision: 0, image: null }, signal())).rejects.toThrow("changed");
    const data = await store.read(scope, signal()); expect(data.fieldValues[0]!.value).toBe("Phone"); expect(data.clients[0]!.image?.name).toBe("sample.png"); expect(data.clients[1]!.image).toBeNull();
    await store.edit(scope, { kind: "image", clientId, revision: 1, image: null }, signal()); expect((await store.read(scope, signal())).clients[0]!.image).toBeNull();
  });
  it("preserves saved state after failure, invalid media, cancellation and workspace changes", async () => {
    const { runtime, store, scope, clientId, fieldId } = setup(); store.setScenario("write-error");
    await expect(store.edit(scope, { kind: "add-field", id: fieldId, name: "Retry" }, signal())).rejects.toThrow("preserved");
    expect((await store.read(scope, signal())).fields).toHaveLength(3);
    await store.edit(scope, { kind: "add-field", id: fieldId, name: "Retry" }, signal());
    await expect(store.edit(scope, { kind: "image", clientId, revision: 0, image: { file: new Blob(["svg"], { type: "image/svg+xml" }), name: "bad.svg" } }, signal())).rejects.toThrow("PNG");
    store.setScenario("slow"); const controller = new AbortController(); const pending = store.edit(scope, { kind: "delete-field", id: fieldId, revision: 0 }, controller.signal); controller.abort(); await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    const switching = store.edit(scope, { kind: "rename-field", id: fieldId, revision: 0, name: "late" }, signal()); runtime.setWorkspace("studio-a-two"); await expect(switching).rejects.toMatchObject({ name: "AbortError" }); runtime.setWorkspace("studio-a"); const current = { ...scope, revision: runtime.getSnapshot().revision }; const data = await store.read(current, signal()); expect(data.fields.find(field => field.id === fieldId)?.name).toBe("Retry"); expect(data.clients[0]!.image).toBeNull();
  });
});
