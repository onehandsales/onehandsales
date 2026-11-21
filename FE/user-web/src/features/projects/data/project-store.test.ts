import { describe, it, expect } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createClientStore } from "@/features/clients";
import { createTeamStore } from "@/features/team";
import { createProjectStore } from "./create-project-store";
import type { ProjectDraft } from "../model/project-types";
// 기능 : 고객·팀·프로젝트의 실제 메모리 저장소 연결을 준비한다.
function setup() { const runtime = createPreviewRuntime(); const clients = createClientStore(runtime); const team = createTeamStore(runtime); const projects = createProjectStore(runtime, clients, team); clients.connect(); team.connect(); projects.connect(); team.connectProjects(projects); runtime.setSession("preview-a"); return { runtime, clients, team, projects }; }
// 기능 : 작업 시작 시점의 계정/workspace/revision을 고정한다.
function scope(runtime: ReturnType<typeof createPreviewRuntime>) { const state = runtime.getSnapshot(); return { actorId: state.session!.id, workspaceId: state.workspaceId!, revision: state.revision }; }
// 기능 : 각 저장 호출에 독립 취소 신호를 제공한다.
function signal() { return new AbortController().signal; }
const draft: ProjectDraft = { name: "Same project", clientId: "studio-a:client-doe", origin: "client", stage: "In Progress" };
describe("G21 shared project creation", () => {
  it("keeps G17 IDs, creates once per submission with explicit initial stage and shares new IDs with invitations", async () => {
    const { runtime, projects, team } = setup(); expect(projects.projects("studio-a").map(p => p.id)).toContain("studio-a:team-project-2"); const s = scope(runtime);
    const [first, duplicate] = await Promise.all([projects.create(s, draft, "one", signal()), projects.create(s, draft, "one", signal())]); expect(first.id).toBe(duplicate.id); expect(first.stage).toBe("New Lead"); expect(first.memberIds).toEqual(["studio-a:member-owner"]); expect(first.created.name).toBe(draft.name);
    const second = await projects.create(s, { ...draft, origin: "column" }, "two", signal()); expect(second.stage).toBe("In Progress"); expect(second.id).not.toBe(first.id); expect(team.projects(s.workspaceId).find(p => p.id === second.id)?.name).toBe(second.name);
    const invitation = await team.invite(s, { email: "new@example.test", role: "Collaborator", projectIds: [second.id] }, signal()); expect(invitation.projectIds).toEqual([second.id]); expect((await projects.read(s, signal())).find(p => p.id === second.id)?.clientName).toBe("Doe Company");
  });
  it("retains the independently saved client after project failure and rejects invalid/foreign clients atomically", async () => {
    const { runtime, projects, clients } = setup(); const s = scope(runtime); const client = await clients.create(s, { companyName: "Sample Client", contactName: "Real test", email: "local@example.test", tagIds: [] }, "new", signal());
    projects.setScenario("write-error"); await expect(projects.create(s, { ...draft, clientId: client.id }, "failed", signal())).rejects.toThrow("preserved"); expect(projects.projects(s.workspaceId)).toHaveLength(3); expect(clients.client(s.workspaceId, client.id)).not.toBeNull();
    const saved = await projects.create(s, { ...draft, clientId: client.id, origin: "global" }, "failed", signal()); expect(saved.clientId).toBe(client.id); expect(saved.stage).toBe("New Lead"); expect(client.id).not.toBe("studio-a:client-sample");
    await expect(projects.create(s, { ...draft, name: " " }, "empty", signal())).rejects.toThrow("title"); await expect(projects.create(s, { ...draft, clientId: "studio-b:client-doe" }, "foreign", signal())).rejects.toThrow("workspace"); expect(projects.projects(s.workspaceId)).toHaveLength(4);
  });
  it("cancels delayed creation on abort/workspace/reset and enforces invitation scope in the data boundary", async () => {
    const { runtime, projects } = setup(); const original = scope(runtime); const saved = await projects.create(original, draft, "saved", signal()); projects.setScenario("slow"); const cancel = new AbortController(); const aborted = projects.create(original, draft, "cancel", cancel.signal); cancel.abort(); await expect(aborted).rejects.toMatchObject({ name: "AbortError" });
    const late = projects.create(original, draft, "late", signal()); runtime.setWorkspace("studio-a-two"); await expect(late).rejects.toMatchObject({ name: "AbortError" }); expect((await projects.read(scope(runtime), signal())).some(p => p.id === saved.id)).toBe(false);
    runtime.setSession(null); runtime.setSession("preview-a"); expect((await projects.read(scope(runtime), signal())).some(p => p.id === saved.id)).toBe(true);
    runtime.openSession({ id: "preview-b", name: "Invited", role: "member", workspaces: [{ id: "studio-a", name: "Studio" }], memberships: { "studio-a": { role: "member", invitation: { teamRowId: "invite", role: "Collaborator", projectIds: [saved.id], allProjects: false } } } }); expect((await projects.read(scope(runtime), signal())).map(p => p.id)).toEqual([saved.id]); await expect(projects.create(scope(runtime), draft, "denied", signal())).rejects.toMatchObject({ kind: "denied" });
    runtime.reset(); runtime.setSession("preview-a"); expect(projects.projects("studio-a")).toHaveLength(3);
  });
});
