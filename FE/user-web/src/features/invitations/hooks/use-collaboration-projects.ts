import { usePreviewEnvironment } from "@/features/preview";
import { useTeamStore } from "@/features/team";
import { invitationAccess } from "@/features/preview";
// 기능 : G17 프로젝트 ID와 현재 초대의 선택 범위로 최소 협업자 화면을 제한한다.
export function useCollaborationProjects() { const { state } = usePreviewEnvironment(); const { store } = useTeamStore(); const access = invitationAccess(state); const projects = state.workspaceId ? store.projects(state.workspaceId).filter(project => !access || access.allProjects || access.projectIds.includes(project.id)).map(project => ({ ...project, recorded: project.id.endsWith(":team-project-2") })) : []; return { projects, access, state }; }
