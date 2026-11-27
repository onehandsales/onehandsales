import type { TeamFixture, TeamProject, TeamRow } from "../model/team-types";
import { INVITATION_WORKSPACE_ID } from "@/mocks/invitation-seed";
// 기능 : 프로젝트 관리 기능 없이 원본 선택을 비교할 최소 작업공간별 목 ID를 만든다.
export function teamProjects(workspaceId: string): TeamProject[] { return ["Consulting Project", "Design Project with Doe Studio", "Rebranding Project"].map((name, index) => ({ id: `${workspaceId}:team-project-${index + 1}`, name })); }
// 기능 : 서로 다른 원본 팀 구성을 분리하고 동명이인을 독립 ID·가상 이메일로 준비한다.
export function teamSeed(workspaceId: string, fixture: TeamFixture): TeamRow[] {
  const common = { workspaceId, revision: 0 }; const design = `${workspaceId}:team-project-2`;
  const rows: TeamRow[] = [
    { ...common, id: `${workspaceId}:member-owner`, name: "Alex (preview)", email: "owner@example.test", role: "Owner", projectIds: [], allProjects: true, status: "joined", joinedOn: "Feb 1, 2024" },
    { ...common, id: `${workspaceId}:invite-jane`, name: "Jane Smith", email: "jane@example.test", role: fixture === "inviting" ? "Partner" : "Collaborator", projectIds: [], allProjects: fixture === "inviting", status: "pending", joinedOn: null },
  ];
  if (fixture === "removing") rows.push(
    { ...common, id: `${workspaceId}:invite-jon`, name: "Jon Smith", email: "jon@example.test", role: "Collaborator", projectIds: [design], allProjects: false, status: "pending", joinedOn: null },
    { ...common, id: `${workspaceId}:member-jon`, name: "Jon Smith", email: "jon2@example.test", role: "Collaborator", projectIds: [design], allProjects: false, status: "joined", joinedOn: "Feb 8, 2024" },
    { ...common, id: `${workspaceId}:invite-smith`, name: "smith@example.test", email: "smith@example.test", role: "Collaborator", projectIds: [design], allProjects: false, status: "pending", joinedOn: null },
  );
  if (workspaceId === INVITATION_WORKSPACE_ID) rows[0]!.name = "Joe Doe";
  return rows;
}
