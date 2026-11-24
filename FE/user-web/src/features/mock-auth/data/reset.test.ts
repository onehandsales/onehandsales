import { describe, expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createAuthStore } from "./create-auth-store";

// 기능 : 비밀이 영속되지 않는 독립 인증 범위를 준비한다.
function setup() { const preview = createPreviewRuntime(); const auth = createAuthStore(preview); auth.connect(); return { auth, preview }; }
// 기능 : 요청 취소 수명을 테스트마다 독립시킨다.
const signal = () => new AbortController().signal;
// 기능 : 같은 계정의 변경 전후 암호를 공개 샘플로 비교한다.
const login = (password: string) => ({ email: "alex@example.test", password, method: "password" as const, captcha: true, returnTo: "/app" });

describe("local password reset lifecycle", () => {
  // 기능 : 새 요청을 시작하면 완료 전에도 이전 링크와 진행 중 저장이 같은 계정을 변경하지 못한다.
  it("invalidates the previous link as soon as a replacement request starts", async () => {
    const { auth, preview } = setup();
    const old = await auth.requestReset("alex@example.test", true, 0, signal());
    const replacement = auth.requestReset("blair@example.test", true, 0, signal());
    expect(auth.getSnapshot().resetChallenge).toBeNull();
    const stale = auth.resetPassword(old.id, "Replacement123!", 0, signal()).then(() => "saved", () => "rejected");
    expect(await stale).toBe("rejected"); expect((await replacement).actorId).toBe("preview-b");
    expect(preview.getSnapshot().session).toBeNull();
    expect((await auth.login(login("PreviewOnly123!"), 0, signal())).account.id).toBe("preview-a");
  });
  // 기능 : 실패·취소·만료는 기존 사용자 세션과 다른 계정의 비밀번호를 유지한다.
  it("retains the active session and other credentials after failed or cancelled recovery", async () => {
    const { auth, preview } = setup(); await auth.login(login("PreviewOnly123!"), 0, signal());
    const revision = preview.getSnapshot().revision; const link = await auth.requestReset("blair@example.test", true, revision, signal());
    auth.setScenario("fail-once"); await expect(auth.resetPassword(link.id, "Replacement123!", revision, signal())).rejects.toThrow("failed");
    const controller = new AbortController(); const saving = auth.resetPassword(link.id, "Replacement123!", revision, controller.signal); controller.abort();
    await expect(saving).rejects.toMatchObject({ name: "AbortError" }); auth.expireReset();
    await expect(auth.resetPassword(link.id, "Replacement123!", revision, signal())).rejects.toThrow("expired");
    expect(preview.getSnapshot().session?.id).toBe("preview-a"); expect(preview.getSnapshot().revision).toBe(revision);
    expect((await auth.login({ ...login("PreviewOnly123!"), email: "blair@example.test" }, revision, signal())).account.id).toBe("preview-b");
  });
  // 기능 : 늦은 새 요청보다 먼저 끝나는 이전 저장도 새 요청 의도 이후에는 반영하지 않는다.
  it("rejects an in-flight save after a newer request starts", async () => {
    const { auth } = setup(); const old = await auth.requestReset("alex@example.test", true, 0, signal());
    const stale = auth.resetPassword(old.id, "Replacement123!", 0, signal()).then(() => "saved", () => "rejected");
    await new Promise(resolve => setTimeout(resolve, 60));
    const replacement = auth.requestReset("blair@example.test", true, 0, signal()).then(result => result.actorId, () => "rejected");
    expect(await stale).toBe("rejected"); expect(await replacement).toBe("preview-b");
    expect((await auth.login(login("PreviewOnly123!"), 0, signal())).account.id).toBe("preview-a");
  });
  it("validates requests, gives a generic receipt for unknown email and never changes another account", async () => {
    const { auth } = setup(); await expect(auth.requestReset("invalid", true, 0, signal())).rejects.toThrow("valid email"); await expect(auth.requestReset("alex@example.test", false, 0, signal())).rejects.toThrow("local preview check");
    const unknown = await auth.requestReset("unknown@example.test", true, 0, signal()); expect(unknown.actorId).toBeNull(); await expect(auth.resetPassword(unknown.id, "Replacement123!", 0, signal())).rejects.toThrow("unavailable");
    expect((await auth.login(login("PreviewOnly123!"), 0, signal())).account.id).toBe("preview-a");
  });
  it("changes only the same account, rejects old password and used link, and does not log in automatically", async () => {
    const { auth, preview } = setup(); const link = await auth.requestReset("alex@example.test", true, 0, signal()); await expect(auth.resetPassword(link.id, "weak", 0, signal())).rejects.toThrow("too weak");
    await auth.resetPassword(link.id, "Replacement123!", 0, signal()); expect(preview.getSnapshot().session).toBeNull(); expect(auth.getSnapshot().notice).toBe("password-reset");
    await expect(auth.resetPassword(link.id, "AnotherSample123!", 0, signal())).rejects.toThrow("already used"); await expect(auth.login(login("PreviewOnly123!"), 0, signal())).rejects.toThrow("incorrect"); expect((await auth.login(login("Replacement123!"), 0, signal())).account.id).toBe("preview-a");
  });
  it("does not commit failed, cancelled, expired or replaced work", async () => {
    const { auth } = setup(); const link = await auth.requestReset("alex@example.test", true, 0, signal()); auth.setScenario("fail-once"); await expect(auth.resetPassword(link.id, "Replacement123!", 0, signal())).rejects.toThrow("failed");
    const controller = new AbortController(); const cancelled = auth.resetPassword(link.id, "Replacement123!", 0, controller.signal); controller.abort(); await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
    const old = auth.resetPassword(link.id, "Replacement123!", 0, signal()); auth.expireReset(); await expect(old).rejects.toMatchObject({ name: "AbortError" });
    const replacement = await auth.requestReset("alex@example.test", true, 0, signal()); expect(replacement.id).not.toBe(link.id); await expect(auth.resetPassword(link.id, "Replacement123!", 0, signal())).rejects.toThrow("unavailable");
    expect((await auth.login(login("PreviewOnly123!"), 0, signal())).account.id).toBe("preview-a");
  });
  it("latest reset request wins, scope changes cancel saving and Reset restores seeded credentials", async () => {
    const { auth, preview } = setup(); const first = auth.requestReset("alex@example.test", true, 0, signal()); const second = auth.requestReset("blair@example.test", true, 0, signal()); await expect(first).rejects.toMatchObject({ name: "AbortError" }); expect((await second).actorId).toBe("preview-b");
    const link = await auth.requestReset("alex@example.test", true, 0, signal()); const stale = auth.resetPassword(link.id, "Replacement123!", 0, signal()); preview.setSession("preview-b"); await expect(stale).rejects.toMatchObject({ name: "AbortError" }); expect(preview.getSnapshot().session?.id).toBe("preview-b");
    preview.reset(); const revision = preview.getSnapshot().revision; expect((await auth.login(login("PreviewOnly123!"), revision, signal())).account.id).toBe("preview-a");
  });
});
