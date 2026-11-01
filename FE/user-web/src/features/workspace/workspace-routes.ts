export const APP_ENTRY_PATH = "/app";

// 기능 : Workspace ID를 앱 Workspace 홈 route로 변환합니다.
export function toWorkspaceHomePath(workspaceId: string) {
  return `${APP_ENTRY_PATH}/workspaces/${encodeURIComponent(workspaceId)}`;
}

// 기능 : Workspace 안의 특정 관리 항목 목록 route로 변환합니다.
export function toWorkspaceObjectPath(
  workspaceId: string,
  objectDefinitionId: string
) {
  return `${toWorkspaceHomePath(workspaceId)}/objects/${encodeURIComponent(objectDefinitionId)}`;
}

// 기능 : Workspace 안의 특정 업무목록 route로 변환합니다.
export function toWorkspaceListPath(workspaceId: string, listDefinitionId: string) {
  return `${toWorkspaceHomePath(workspaceId)}/lists/${encodeURIComponent(listDefinitionId)}`;
}

// 기능 : 즐겨찾기 View와 명시한 열 위치를 새로고침 가능한 URL에 보존합니다.
export function toWorkspaceViewPath(workspaceId: string, viewDefinitionId: string, sourceType?: "OBJECT" | "LIST") {
  return `${toWorkspaceHomePath(workspaceId)}/view-definitions/${encodeURIComponent(viewDefinitionId)}${sourceType ? "?sourceType=" + sourceType : ""}`;
}

// 기능 : View ID로 직접 여는 route를 공통 헤더·본문 화면으로 식별합니다.
export function isWorkspaceViewPath(pathname: string) {
  return /^\/app\/workspaces\/[^/]+\/view-definitions\/[^/]+\/?$/.test(pathname);
}

// 기능 : 현재 pathname이 Workspace 업무목록 route인지 확인합니다.
export function isWorkspaceListPath(pathname: string) {
  return /^\/app\/workspaces\/[^/]+\/lists\/[^/]+\/?$/.test(pathname);
}

// 기능 : 현재 pathname이 Workspace 홈 route인지 확인합니다.
export function isWorkspaceHomePath(pathname: string) {
  return /^\/app\/workspaces\/[^/]+\/?$/.test(pathname);
}

// 기능 : 현재 pathname이 Workspace 관리 항목 목록 route인지 확인합니다.
export function isWorkspaceObjectPath(pathname: string) {
  return /^\/app\/workspaces\/[^/]+\/objects\/[^/]+\/?$/.test(pathname);
}
