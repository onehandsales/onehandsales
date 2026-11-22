import { expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createClientStore } from "@/features/clients";
import { createTeamStore } from "@/features/team";
import { createProjectStore } from "@/features/projects";
import { createTaskStore } from "./create-task-store";
import { newTaskDraft, taskSummary, validateTaskDraft, taskDueLabel } from "../model/task-values";
// 기능 : 실제 가상 계정·고객·프로젝트·팀·작업 원본을 연결한다.
function setup() { const runtime = createPreviewRuntime(); const clients = createClientStore(runtime); const team = createTeamStore(runtime); const projects = createProjectStore(runtime, clients, team); const tasks = createTaskStore(runtime, projects, team); clients.connect(); team.connect(); projects.connect(); team.connectProjects(projects); tasks.connect(); runtime.setSession("preview-a"); return { runtime, clients, team, projects, tasks }; }
// 기능 : 변경 시작 시점의 가상 작업 문맥을 고정한다.
function scope(runtime: ReturnType<typeof createPreviewRuntime>) { const state = runtime.getSnapshot(); return { actorId: state.session!.id, workspaceId: state.workspaceId!, revision: state.revision }; }
// 기능 : 각 검증 호출에 독립 취소 신호를 제공한다.
function signal() { return new AbortController().signal; }
const projectId = "studio-a:team-project-2";
const draft = { ...newTaskDraft(projectId), title: "Send invite" };
// 기능 : 빈 초안·제목·날짜 경계를 검증하고 집계와 상대 날짜를 동일 기준으로 계산한다.
it("G25 validates drafts and keeps duplicate-title tasks, reference-day buckets and missing due dates distinct", async () => { const { runtime, tasks } = setup(); const data = await tasks.read(scope(runtime), signal()); expect(data).toHaveLength(3); expect(data.filter(task => task.title === "Initial Chat").map(task => task.id)).toEqual(["studio-a:task-initial-chat-1", "studio-a:task-initial-chat-2"]); expect(taskSummary(data)).toEqual({ Upcoming: 1, "Due Today": 0, Overdue: 2, Completed: 0 }); expect(taskDueLabel("2024-02-06")).toBe("Yesterday"); expect(taskDueLabel("")).toBe("No due date"); expect(() => validateTaskDraft(newTaskDraft())).toThrow("title"); expect(() => validateTaskDraft({ ...draft, projectId: "" })).toThrow("project"); expect(() => validateTaskDraft({ ...draft, dueDate: "2023-02-29" })).toThrow("valid due"); expect(validateTaskDraft({ ...draft, dueDate: "2024-02-29" }).dueDate).toBe("2024-02-29"); });
// 기능 : 생성 중복·실패·필드 저장·상태 활동과 프로젝트/시간 소비의 ID를 검증한다.
it("G25 creates one ID, persists atomic fields and rejects stale edits without altering project history or recorded time", async () => { const { runtime, tasks, projects, team } = setup(); const s = scope(runtime); const time = projects.current(s, projectId)!.timeEntries; tasks.setScenario("write-error"); await expect(tasks.create(s, draft, "one", signal())).rejects.toThrow("preserved"); expect(await tasks.read(s, signal())).toHaveLength(3); const [a, duplicate] = await Promise.all([tasks.create(s, draft, "one", signal()), tasks.create(s, draft, "one", signal())]); expect(a.id).toBe(duplicate.id); expect(team.joinedMembers(s.workspaceId)).toHaveLength(1); const edited = await tasks.edit(s, a.id, a.revision, { ...draft, status: "In Progress", dueDate: "2024-02-07", assigneeId: "studio-a:member-owner", description: "**plain** 한국어" }, signal()); expect(edited.activities.map(event => event.kind)).toEqual(["status", "assignment"]); expect(taskSummary(await tasks.read(s, signal()))["Due Today"]).toBe(1); expect(projects.current(s, projectId)!.timeEntries).toEqual(time); await expect(tasks.edit(s, a.id, 0, { ...draft, title: "stale" }, signal())).rejects.toThrow("changed"); expect(tasks.current(s, a.id)?.title).toBe("Send invite"); const clone = tasks.current(s, a.id)!; clone.title = "mutated"; expect(tasks.current(s, a.id)?.title).toBe("Send invite"); });
// 기능 : 배정 밖 작업·미수락 담당자·다른 프로젝트 이동을 저장소 경계에서 거부한다.
it("G25 enforces assigned projects and joined member ownership for direct IDs and new work", async () => { const { runtime, tasks, team } = setup(); const s = scope(runtime); const pending = await team.invite(s, { email: "member@example.test", role: "Collaborator", projectIds: [projectId] }, signal()); expect(tasks.members(s, projectId).some(member => member.id === pending.id)).toBe(false); await expect(tasks.create(s, { ...draft, assigneeId: pending.id }, "pending", signal())).rejects.toThrow("joined member"); const joined = team.accept(pending, "Joined member"); const assigned = await tasks.create(s, { ...draft, assigneeId: joined.id }, "joined", signal()); expect(assigned.assigneeId).toBe(joined.id); await expect(tasks.edit(s, assigned.id, 0, { ...draft, projectId: "studio-a:team-project-1" }, signal())).rejects.toThrow("Moving"); runtime.openSession({ id: "preview-b", name: "Joined member", role: "member", workspaces: [{ id: "studio-a", name: "Studio" }], memberships: { "studio-a": { role: "member", invitation: { teamRowId: joined.id, role: "Collaborator", projectIds: ["studio-a:team-project-1"], allProjects: false } } } }); const invited = scope(runtime); expect(tasks.current(invited, assigned.id)).toBeNull(); expect(await tasks.read(invited, signal())).toEqual([]); await expect(tasks.create(invited, draft, "foreign", signal())).rejects.toThrow("outside"); const local = await tasks.create(invited, { ...draft, projectId: "studio-a:team-project-1", assigneeId: null }, "allowed", signal()); expect(local.projectId).toBe("studio-a:team-project-1"); });
// 기능 : 취소·문맥 전환·Reset 뒤 늦은 저장과 조회 오류의 재시도를 검증한다.
it("G25 cancels late saves across abort/logout/workspace/reset while retaining same-tab saved rows", async () => { const { runtime, tasks } = setup(); const s = scope(runtime); const saved = await tasks.create(s, draft, "saved", signal()); tasks.setScenario("slow"); const abort = new AbortController(); const write = tasks.edit(s, saved.id, 0, { ...draft, title: "late" }, abort.signal); abort.abort(); await expect(write).rejects.toMatchObject({ name: "AbortError" }); const crossing = tasks.create(s, draft, "crossing", signal()); runtime.setWorkspace("studio-a-two"); await expect(crossing).rejects.toMatchObject({ name: "AbortError" }); expect(tasks.current(scope(runtime), saved.id)).toBeNull(); runtime.setSession(null); runtime.setSession("preview-a"); expect(tasks.current(scope(runtime), saved.id)?.title).toBe(draft.title); tasks.setScenario("read-error"); await expect(tasks.read(scope(runtime), signal())).rejects.toThrow("Unable"); expect(await tasks.read(scope(runtime), signal())).toHaveLength(4); runtime.reset(); runtime.setSession("preview-a"); expect(tasks.current(scope(runtime), saved.id)).toBeNull(); tasks.setScenario("empty"); expect(await tasks.read(scope(runtime), signal())).toEqual([]); tasks.setScenario("denied"); await expect(tasks.read(scope(runtime), signal())).rejects.toMatchObject({ kind: "denied" }); });
// 기능 : 하위 저장·완료·담당자는 부모 필드와 독립이며 동명 항목도 서로 다른 ID를 갖는다.
it("G26 keeps child identities and revisions independent from parent fields and all-complete never completes the parent", async () => {
  const { runtime, tasks } = setup(); const s = scope(runtime); const parent = tasks.current(s, "studio-a:task-initial-chat-1")!;
  await expect(tasks.addSubtask(s, parent.id, " ", "blank", signal())).rejects.toThrow("title");
  const [first, duplicate] = await Promise.all([tasks.addSubtask(s, parent.id, "Send invite", "first", signal()), tasks.addSubtask(s, parent.id, "Send invite", "first", signal())]); expect(first.id).toBe(duplicate.id);
  const second = await tasks.addSubtask(s, parent.id, "Send invite", "second", signal()); expect(second.id).not.toBe(first.id); expect(first.assigneeId).toBeNull();
  const completed = await tasks.editSubtask(s, parent.id, first.id, first.revision, { completed: true }, signal());
  const assigned = await tasks.editSubtask(s, parent.id, first.id, completed.revision, { assigneeId: "studio-a:member-owner" }, signal()); expect(assigned.completed).toBe(true);
  await tasks.editSubtask(s, parent.id, second.id, second.revision, { completed: true }, signal());
  const renamedParent = await tasks.edit(s, parent.id, parent.revision, { ...parent, title: "Parent renamed" }, signal()); expect(renamedParent.status).toBe("In Progress"); expect(renamedParent.subtasks).toHaveLength(2); expect(renamedParent.subtasks.every(child => child.completed)).toBe(true);
  const renamed = await tasks.editSubtask(s, parent.id, first.id, assigned.revision, { title: "Send invite changed" }, signal()); expect(renamed.assigneeId).toBe("studio-a:member-owner");
  await expect(tasks.editSubtask(s, parent.id, first.id, assigned.revision, { title: "stale" }, signal())).rejects.toThrow("changed");
  await tasks.editSubtask(s, parent.id, first.id, renamed.revision, { completed: false }, signal()); expect(tasks.current(s, parent.id)?.title).toBe("Parent renamed"); expect((await tasks.read(s, signal()))).toHaveLength(3);
});
// 기능 : 하위 저장 실패·취소·문맥 변경은 기존 목록을 바꾸거나 늦은 항목을 만들지 않는다.
it("G26 preserves child inputs on failure and rejects aborted, missing-parent and stale-workspace writes", async () => {
  const { runtime, tasks } = setup(); const s = scope(runtime); const id = "studio-a:task-initial-chat-1"; tasks.setScenario("write-error");
  await expect(tasks.addSubtask(s, id, "Retry child", "retry", signal())).rejects.toThrow("preserved"); expect(tasks.current(s, id)?.subtasks).toHaveLength(0); const row = await tasks.addSubtask(s, id, "Retry child", "retry", signal()); expect(row.title).toBe("Retry child");
  const controller = new AbortController(); tasks.setScenario("slow"); const cancelled = tasks.editSubtask(s, id, row.id, row.revision, { completed: true }, controller.signal); controller.abort(); await expect(cancelled).rejects.toThrow(); expect(tasks.current(s, id)?.subtasks[0]?.completed).toBe(false);
  const late = tasks.addSubtask(s, id, "Late child", "late", signal()); runtime.setSession("preview-b"); await expect(late).rejects.toThrow(); runtime.setSession("preview-a"); const restored = scope(runtime); expect(tasks.current(restored, id)?.subtasks).toHaveLength(1);
  await expect(tasks.editSubtask(restored, id, "missing", 0, { completed: true }, signal())).rejects.toThrow("unavailable"); await expect(tasks.addSubtask(restored, "missing", "No parent", "missing", signal())).rejects.toThrow("parent"); runtime.reset(); runtime.setSession("preview-a"); expect(tasks.current(scope(runtime), id)?.subtasks).toHaveLength(0);
});
// 기능 : 하위 담당자는 같은 프로젝트의 수락된 멤버만 허용하며 부모 배정을 변경하지 않는다.
it("G26 excludes pending and foreign assignees while allowing assignment on completed children", async () => {
  const { runtime, tasks, team } = setup(); const s = scope(runtime); const id = "studio-a:task-initial-chat-1"; const child = await tasks.addSubtask(s, id, "Send invite", "assign", signal());
  const pending = await team.invite(s, { email: "subtask@example.test", role: "Collaborator", projectIds: [projectId] }, signal());
  await expect(tasks.editSubtask(s, id, child.id, 0, { assigneeId: pending.id }, signal())).rejects.toThrow("joined member"); team.accept(pending, "Subtask member");
  const completed = await tasks.editSubtask(s, id, child.id, 0, { completed: true }, signal()); const assigned = await tasks.editSubtask(s, id, child.id, completed.revision, { assigneeId: pending.id }, signal()); expect(assigned.completed).toBe(true); expect(tasks.current(s, id)?.assigneeId).toBe("studio-a:member-owner");
  await expect(tasks.editSubtask(s, id, child.id, assigned.revision, { assigneeId: "studio-b:member-owner" }, signal())).rejects.toThrow("joined member"); const cleared = await tasks.editSubtask(s, id, child.id, assigned.revision, { assigneeId: null }, signal()); expect(cleared.completed).toBe(true); expect(cleared.assigneeId).toBeNull();
});

// 기능 : 댓글의 중복·순서·본문 보존과 부모 저장 경합에서의 독립 append를 검증한다.
it("G27 appends comments once, preserves literal text and never lets a stale parent snapshot erase comments or history", async () => {
  const { runtime, tasks } = setup(); const s = scope(runtime); const parent = tasks.current(s, "studio-a:task-initial-chat-1")!;
  const body = "<b>한국어</b>\n**plain text**"; const [first, duplicate] = await Promise.all([tasks.addComment(s, parent.id, body, "one", signal()), tasks.addComment(s, parent.id, body, "one", signal())]); expect(first.id).toBe(duplicate.id);
  const [second, renamed] = await Promise.all([tasks.addComment(s, parent.id, "second", "two", signal()), tasks.edit(s, parent.id, parent.revision, { ...parent, title: "Changed title", status: "Done", assigneeId: null }, signal())]);
  const current = tasks.current(s, parent.id)!; expect(current.activities.filter(event => event.kind === "comment")).toEqual([first, second]); expect(renamed.revision).toBe(1); expect(first.taskTitle).toBe("Initial Chat"); expect(first.body).toBe(body); expect(current.activities.filter(event => event.kind !== "comment").map(event => event.kind)).toEqual(["status", "assignment"]);
  const snapshot = structuredClone(current.activities); await tasks.edit(s, parent.id, current.revision, { ...current, title: "Another title" }, signal()); expect(tasks.current(s, parent.id)?.activities).toEqual(snapshot);
  await expect(tasks.addComment(s, parent.id, " ", "empty", signal())).rejects.toThrow("1–4000"); await expect(tasks.addComment(s, parent.id, "a".repeat(4001), "long", signal())).rejects.toThrow("1–4000");
});

// 기능 : 실패·취소·workspace 이탈·Reset이 중복이나 늦은 댓글을 만들지 않도록 검증한다.
it("G27 retains saved comments on logout but rejects failed, cancelled, cross-scope and missing-task appends", async () => {
  const { runtime, tasks } = setup(); const s = scope(runtime); const id = "studio-a:task-initial-chat-1"; tasks.setScenario("write-error");
  await expect(tasks.addComment(s, id, "Retry body", "retry", signal())).rejects.toThrow("preserved"); expect(tasks.current(s, id)?.activities).toHaveLength(0); await tasks.addComment(s, id, "Retry body", "retry", signal());
  const controller = new AbortController(); tasks.setScenario("slow"); const cancelled = tasks.addComment(s, id, "Cancelled", "cancel", controller.signal); controller.abort(); await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
  const crossing = tasks.addComment(s, id, "Wrong workspace", "cross", signal()); runtime.setWorkspace("studio-a-two"); await expect(crossing).rejects.toMatchObject({ name: "AbortError" }); runtime.setSession(null); runtime.setSession("preview-a"); expect(tasks.current(scope(runtime), id)?.activities).toHaveLength(1);
  await expect(tasks.addComment(scope(runtime), "missing", "Body", "missing", signal())).rejects.toThrow("unavailable"); runtime.reset(); runtime.setSession("preview-a"); expect(tasks.current(scope(runtime), id)?.activities).toHaveLength(0);
});

// 기능 : 협업자 댓글은 배정 프로젝트에만 저장하고 작성자 snapshot과 기존 소유자 댓글을 보존한다.
it("G27 scopes collaborator read/write to the assigned project without changing comment authors", async () => {
  const { runtime, tasks, team } = setup(); const s = scope(runtime); const id = "studio-a:task-initial-chat-1";
  const owner = await tasks.addComment(s, id, "Owner comment", "owner", signal()); const pending = await team.invite(s, { email: "comment@example.test", role: "Collaborator", projectIds: [projectId] }, signal()); team.accept(pending, "Comment member");
  const outside = await tasks.create(s, { ...draft, projectId: "studio-a:team-project-1" }, "outside", signal());
  runtime.openSession({ id: "preview-b", name: "Comment member", role: "member", workspaces: [{ id: "studio-a", name: "Studio" }], memberships: { "studio-a": { role: "member", invitation: { teamRowId: pending.id, role: "Collaborator", projectIds: [projectId], allProjects: false } } } });
  const joined = scope(runtime); expect(tasks.current(joined, id)?.activities).toEqual([owner]); const comment = await tasks.addComment(joined, id, "Collaborator comment", "member", signal()); expect(comment.actorId).toBe("preview-b"); expect(comment.actorName).toBe("Comment member");
  expect(tasks.current(joined, outside.id)).toBeNull(); await expect(tasks.addComment(joined, outside.id, "Denied", "denied", signal())).rejects.toThrow("outside"); expect(tasks.current(joined, id)?.activities[0]?.actorName).toBe(owner.actorName);
});
