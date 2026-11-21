// 기능 : 공개 초대 링크와 기존 로그인 복귀용 보호 경로를 동일 ID로 만든다.
export function invitationPath(workspaceId: string, id: string, protectedPath = false) { return `${protectedPath ? "/app/invitations" : "/invite"}/${encodeURIComponent(workspaceId)}/${encodeURIComponent(id)}`; }
