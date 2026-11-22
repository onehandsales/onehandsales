import { useTeamStore } from "@/features/team";
import type { Project } from "../model/project-types";
// 기능 : 프로젝트 기본 참여자와 수락 완료된 배정 멤버를 같은 팀 ID로 조회한다.
export function useProjectMembers(project: Project) { const { store } = useTeamStore(); return store.joinedMembers(project.workspaceId).filter(member => project.memberIds.includes(member.id) || member.allProjects || member.projectIds.includes(project.id)); }
