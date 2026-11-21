import { describe, expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createAuthStore } from "./create-auth-store";
import { previewReturnPath, authReturnQuery } from "@/features/preview/model/preview-return-path";

// 기능 : 매 검증마다 독립 계정·세션 저장소를 연결한다.
function setup() { const preview = createPreviewRuntime(); const auth = createAuthStore(preview); auth.connect(); return { auth, preview }; }
// 기능 : 로그인을 실제 서비스와 무관한 공개 표본으로 실행한다.
const input = () => ({ email: "alex@example.test", password: "PreviewOnly123!", method: "password" as const, captcha: true, returnTo: "/app/items/item-1?q=a#detail" });
// 기능 : 요청별 취소 수명을 분리한다.
const signal = () => new AbortController().signal;

describe("local login, factors and logout boundaries", () => {
  it("accepts only a valid sample credential and preserves the safe internal destination", async () => {
    const { auth, preview } = setup(); await expect(auth.login({ ...input(), password: "WrongSample123!" }, 0, signal())).rejects.toThrow("incorrect"); expect(preview.getSnapshot().session).toBeNull();
    const result = await auth.login(input(), 0, signal()); expect(result.account.id).toBe("preview-a"); expect(result.returnTo).toBe(input().returnTo); expect(result.committedRevision).toBe(preview.getSnapshot().revision);
    await auth.logout(result.committedRevision, signal()); expect(preview.getSnapshot().session).toBeNull(); expect(auth.getSnapshot().notice).toBe("signed-out");
  });
  it("logs a created account back in with its original identity and rejects another password", async () => {
    const { auth, preview } = setup(); const created = await auth.register({ email: "local@example.test", name: "Local", password: "NewSample123!", method: "password" }, 0, signal());
    await auth.logout(preview.getSnapshot().revision, signal()); const revision = preview.getSnapshot().revision;
    await expect(auth.login({ ...input(), email: "local@example.test" }, revision, signal())).rejects.toThrow("incorrect");
    expect((await auth.login({ ...input(), email: "local@example.test", password: "NewSample123!" }, revision, signal())).account.id).toBe(created.account.id);
  });
  it("does not open a session before factor confirmation, and renewal/expiry invalidate older work", async () => {
    const { auth, preview } = setup(); auth.setScenario("two-factor"); expect((await auth.login(input(), 0, signal())).kind).toBe("two-factor"); expect(preview.getSnapshot().session).toBeNull();
    await expect(auth.verifyFactor("000000", 0, signal())).rejects.toThrow("Incorrect"); expect(auth.getSnapshot().twoFactor?.attempts).toBe(1);
    const old = auth.verifyFactor("123456", 0, signal()); auth.expireFactor(); await expect(old).rejects.toMatchObject({ name: "AbortError" });
    await expect(auth.verifyFactor("123456", 0, signal())).rejects.toThrow("expired"); auth.renewFactor();
    expect((await auth.verifyFactor("123456", 0, signal())).account.id).toBe("preview-a"); expect(auth.getSnapshot().twoFactor).toBeNull();
  });
  it("preserves the session on logout failure/cancel and prevents an old logout clearing a new actor", async () => {
    const { auth, preview } = setup(); preview.setSession("preview-a"); auth.setScenario("fail-once"); await expect(auth.logout(preview.getSnapshot().revision, signal())).rejects.toThrow("failed"); expect(preview.getSnapshot().session?.id).toBe("preview-a");
    auth.setScenario("slow"); const controller = new AbortController(); const cancel = auth.logout(preview.getSnapshot().revision, controller.signal); controller.abort(); await expect(cancel).rejects.toMatchObject({ name: "AbortError" });
    auth.setScenario("normal"); const late = auth.logout(preview.getSnapshot().revision, signal()); preview.setSession("preview-b"); await expect(late).rejects.toMatchObject({ name: "AbortError" }); expect(preview.getSnapshot().session?.id).toBe("preview-b");
  });
  it("does not reuse a cancelled factor or a login from a previous scope", async () => {
    const { auth, preview } = setup(); auth.setScenario("two-factor"); await auth.login(input(), 0, signal()); auth.cancelFactor(); await expect(auth.verifyFactor("123456", 0, signal())).rejects.toThrow("unavailable");
    auth.setScenario("normal"); const old = auth.login(input(), 0, signal()); preview.reset(); await expect(old).rejects.toMatchObject({ name: "AbortError" }); expect(preview.getSnapshot().session).toBeNull();
  });
  it("rejects external, traversal and backslash return targets while retaining valid query/hash", () => {
    for (const path of ["https://other.test/app", "//other.test/app", "/application", "/app/../../login", "/app/%2e%2e/login", "/app\\other"]) expect(previewReturnPath(path)).toBe("/app");
    expect(previewReturnPath("/app/items/preview?q=1#name")).toBe("/app/items/preview?q=1#name");
    expect(authReturnQuery("?returnTo=%2Fapp%2Fsettings%2Fcompany%3Ffrom%3Dprotected%23details")).toBe("?returnTo=%2Fapp%2Fsettings%2Fcompany%3Ffrom%3Dprotected%23details");
    expect(authReturnQuery("?returnTo=%2F%2Foutside.test%2Fapp")).toBe("");
  });
});
