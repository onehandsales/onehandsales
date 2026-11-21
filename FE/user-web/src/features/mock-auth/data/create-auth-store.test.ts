import { describe, expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createAuthStore } from "./create-auth-store";
import { passwordStrength, validateSignup } from "../model/auth-validation";
import type { PublicIntent } from "@/features/public-web";

// 기능 : 독립 세션과 가상 계정 저장소의 수명 구독을 테스트에 조립한다.
function setup() { const preview = createPreviewRuntime(); const auth = createAuthStore(preview); auth.connect(); return { preview, auth }; }
// 기능 : 실제 자격 증명이 아닌 가입 표본을 만든다.
const sample = () => ({ email: "sample@example.test", name: "Sample Owner", password: "SampleOnly123!", method: "password" as const });
// 기능 : 각 요청이 독립된 취소 수명을 갖게 한다.
const signal = () => new AbortController().signal;

describe("mock signup ownership and cancellation", () => {
  it("validates observed length separately from assumed strength and local CAPTCHA", () => {
    expect(passwordStrength("abcdefghij")).toBe("Too Weak"); expect(passwordStrength("SampleOnly123!")).toBe("Strong");
    expect(validateSignup("bad", " ", "short", false)).toHaveProperty("captcha");
    expect(validateSignup("sample@example.test", "한국어 이름", "SampleOnly123!", true)).toEqual({});
  });
  it("copies only the selected handoff across a new revision and removes it on actor/workspace/reset changes", async () => {
    const { auth, preview } = setup();
    const intent: PublicIntent = { source: "quote", sourcePath: "/templates", returnTo: "/templates", email: "sample@example.test", template: { id: "quote-sample", title: "Quote", path: "/quote", type: "Quote", format: "Word", reference: "source" } };
    const pending = auth.register({ ...sample(), intent }, 0, signal()); intent.template = { ...intent.template!, format: "PDF" };
    const result = await pending;
    expect(result.account.id).not.toBe("preview-a"); expect(auth.getSnapshot().handoff?.intent.template?.format).toBe("Word");
    expect(auth.getSnapshot().handoff).toMatchObject({ actorId: result.account.id, revision: 1, workspaceId: "studio-user-1" });
    preview.setSession(null); expect(auth.getSnapshot().handoff).toBeNull(); expect(auth.getAccount(result.account.id)).toBeDefined();
    preview.reset(); expect(auth.getAccount(result.account.id)).toBeUndefined();
  });
  it("allows only one concurrent signup and rejects a duplicate after logout", async () => {
    const { auth, preview } = setup(); const results = await Promise.allSettled([auth.register(sample(), 0, signal()), auth.register(sample(), 0, signal())]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    preview.setSession(null); await expect(auth.register(sample(), preview.getSnapshot().revision, signal())).rejects.toThrow("already has");
  });
  it("cancels before commit on abort, scenario change and Reset, without reserving the email", async () => {
    const { auth, preview } = setup(); auth.setScenario("slow");
    const controller = new AbortController(); const cancelled = auth.register(sample(), 0, controller.signal); controller.abort(); await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
    const old = auth.register({ ...sample(), method: "google" }, 0, signal()); auth.setScenario("normal"); await expect(old).rejects.toMatchObject({ name: "AbortError" });
    const stale = auth.register({ ...sample(), method: "google" }, 0, signal()); preview.reset(); await expect(stale).rejects.toMatchObject({ name: "AbortError" });
    expect((await auth.register(sample(), preview.getSnapshot().revision, signal())).kind).toBe("session");
  });
  it("retries failure once without partial account creation and never exposes password in snapshots", async () => {
    const { auth } = setup(); auth.setScenario("fail-once"); await expect(auth.register(sample(), 0, signal())).rejects.toThrow("failed");
    const result = await auth.register(sample(), 0, signal()); expect(result.kind).toBe("session");
    expect(JSON.stringify([auth.getSnapshot(), result, auth.getAccount(result.account.id)])).not.toContain(sample().password);
  });
  it("expires and cancels unverified accounts, then confirms the same ID exactly once", async () => {
    const { auth } = setup(); auth.setScenario("verify-email"); const first = await auth.register(sample(), 0, signal());
    const expired = auth.getSnapshot().emailChallenge!; auth.expireEmailChallenge(); await expect(auth.verifyEmail(expired.id, 0, signal())).rejects.toThrow("expired");
    auth.cancelEmailChallenge(); expect(auth.getAccount(first.account.id)).toBeUndefined();
    const second = await auth.register(sample(), 0, signal()); const challenge = auth.getSnapshot().emailChallenge!;
    expect((await auth.verifyEmail(challenge.id, 0, signal())).id).toBe(second.account.id);
    await expect(auth.verifyEmail(challenge.id, 0, signal())).rejects.toThrow("unavailable");
  });
});
