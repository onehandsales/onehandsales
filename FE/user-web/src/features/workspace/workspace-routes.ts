export const APP_ENTRY_PATH = "/app";

// 기능 : Workspace ID를 앱 Workspace 홈 route로 변환합니다.
export function toWorkspaceHomePath(workspaceId: string) {
  return `${APP_ENTRY_PATH}/workspaces/${encodeURIComponent(workspaceId)}`;
}

// 기능 : 현재 pathname이 Workspace 홈 route인지 확인합니다.
export function isWorkspaceHomePath(pathname: string) {
  return /^\/app\/workspaces\/[^/]+\/?$/.test(pathname);
}
