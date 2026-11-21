import { describe, expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createAuthStore } from "@/features/mock-auth/data/create-auth-store";
import { createTeamStore } from "@/features/team/data/create-team-store";
import { invitationAccess } from "@/features/preview";
// 기능 : 같은 workspace·초대 ID를 가진 소유자 팀과 초대 수락자를 독립 목 실행에 준비한다.
function setup() {
  const preview = createPreviewRuntime(); const auth = createAuthStore(preview); const team = createTeamStore(preview); team.connect(); auth.connect(); preview.setSession("preview-a");
  const scope = { actorId: "preview-a" as const, workspaceId: "studio-a", revision: preview.getSnapshot().revision }; team.setFixture(scope, "removing"); preview.setSession(null);
  return { preview, auth, team, target: team.invitation("studio-a", "studio-a:invite-jon")! };
}
// 기능 : 기본 초대 수락을 실제 두 저장소 사이에서 실행한다.
function accept(value: ReturnType<typeof setup>, signal = new AbortController().signal) { return value.auth.acceptInvitation({ target: value.target, name: "Jon Smith", password: "PreviewOnly123!" }, value.preview.getSnapshot().revision, signal, name => value.team.accept(value.target, name)); }
describe("G18 invitation membership boundaries", () => {
  it("commits the same pending ID once, opens only assigned workspace access and preserves it on local relogin", async () => {
    const value = setup(); const first = accept(value); const second = accept(value); const results = await Promise.allSettled([first, second]); expect(results.filter(item => item.status === "fulfilled")).toHaveLength(1);
    const joined = value.team.invitation("studio-a", value.target.id)!; expect(joined).toMatchObject({ id: value.target.id, status: "joined", revision: 1 }); expect(value.team.invitation("studio-a", "studio-a:member-jon")?.email).toBe("jon2@example.test");
    expect(invitationAccess(value.preview.getSnapshot())?.projectIds).toEqual(["studio-a:team-project-2"]);
    value.preview.setSession(null); await value.auth.login({ email: "jon@example.test", password: "PreviewOnly123!", method: "password", captcha: true, returnTo: "/app" }, value.preview.getSnapshot().revision, new AbortController().signal);
    expect(invitationAccess(value.preview.getSnapshot())?.teamRowId).toBe(value.target.id); expect(() => value.team.accept(value.target, "Again")).toThrow("already accepted");
  });
  it("keeps the invitation pending on invalid input/failure/cancel and rejects late session or reset results", async () => {
    const value = setup(); value.auth.setScenario("fail-once"); await expect(accept(value)).rejects.toThrow("failed"); expect(value.team.invitation("studio-a", value.target.id)?.status).toBe("pending");
    value.auth.setScenario("slow"); const cancel = new AbortController(); const pending = accept(value, cancel.signal); cancel.abort(); await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    const late = accept(value); value.preview.setSession("preview-b"); await expect(late).rejects.toMatchObject({ name: "AbortError" }); expect(value.team.invitation("studio-a", value.target.id)?.status).toBe("pending");
    value.preview.setSession(null); const reset = accept(value); value.preview.reset(); await expect(reset).rejects.toMatchObject({ name: "AbortError" }); expect(value.preview.getSnapshot().session).toBeNull();
  });
  it("rejects expired/removed invitations without creating an account and allows corrected retry", async () => {
    const value = setup(); value.team.setScenario("expired"); await expect(accept(value)).rejects.toThrow("unavailable"); expect(value.preview.getSnapshot().session).toBeNull();
    value.team.setScenario("normal"); value.preview.setSession("preview-a"); await value.team.remove({ actorId: "preview-a", workspaceId: "studio-a", revision: value.preview.getSnapshot().revision }, value.target, new AbortController().signal); value.preview.setSession(null);
    await expect(accept(value)).rejects.toThrow("removed"); expect(value.team.invitation("studio-a", value.target.id)).toBeNull();
    const other = setup(); other.auth.setScenario("fail-once"); await expect(accept(other)).rejects.toThrow(); await accept(other); expect(other.team.invitation("studio-a", other.target.id)?.status).toBe("joined");
  });
  it("requires matching existing email and preserves existing membership when switching workspaces", async () => {
    const value = setup(); value.preview.setSession("preview-b"); await expect(accept(value)).rejects.toThrow("another email"); value.preview.setSession("preview-a");
    const scope = { actorId: "preview-a" as const, workspaceId: "studio-a", revision: value.preview.getSnapshot().revision }; const target = await value.team.invite(scope, { email: "blair@example.test", role: "Collaborator", projectIds: ["studio-a:team-project-2"] }, new AbortController().signal);
    value.preview.setSession(null); await expect(value.auth.acceptInvitation({ target, name: "", password: "" }, value.preview.getSnapshot().revision, new AbortController().signal, name => value.team.accept(target, name))).rejects.toThrow("Log in");
    value.preview.setSession("preview-b"); const account = await value.auth.acceptInvitation({ target, name: "", password: "" }, value.preview.getSnapshot().revision, new AbortController().signal, name => value.team.accept(target, name)); expect(account.id).toBe("preview-b"); expect(invitationAccess(value.preview.getSnapshot())?.teamRowId).toBe(target.id);
    value.preview.setWorkspace("studio-b"); expect(invitationAccess(value.preview.getSnapshot())).toBeUndefined(); expect(value.preview.getSnapshot().session?.role).toBe("member");
    value.preview.setWorkspace("studio-a"); expect(invitationAccess(value.preview.getSnapshot())?.teamRowId).toBe(target.id);
  });
  it("keeps a previously owned workspace owner-only and denies the invited workspace team store", async () => {
    const value = setup(); value.preview.openSession({ id: "preview-b", name: "Inviter fixture", role: "owner", workspaces: [{ id: "external-studio", name: "External studio" }] });
    const target = await value.team.invite({ actorId: "preview-b", workspaceId: "external-studio", revision: value.preview.getSnapshot().revision }, { email: "alex@example.test", role: "Collaborator", projectIds: [] }, new AbortController().signal);
    value.preview.setSession("preview-a"); await value.auth.acceptInvitation({ target, name: "", password: "" }, value.preview.getSnapshot().revision, new AbortController().signal, name => value.team.accept(target, name));
    expect(value.preview.getSnapshot().session?.role).toBe("member"); await expect(value.team.read({ actorId: "preview-a", workspaceId: "external-studio", revision: value.preview.getSnapshot().revision }, new AbortController().signal)).rejects.toThrow("unavailable");
    value.preview.setWorkspace("studio-a"); expect(value.preview.getSnapshot().session?.role).toBe("owner"); expect(invitationAccess(value.preview.getSnapshot())).toBeUndefined();
  });
});
