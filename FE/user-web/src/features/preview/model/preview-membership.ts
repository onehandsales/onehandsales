import type { PreviewState } from "./preview-types";
// 기능 : 현재 작업공간에만 적용되는 초대 권한을 읽어 다른 소유 작업공간으로 전파하지 않는다.
export function invitationAccess(state: PreviewState) { return state.workspaceId ? state.session?.memberships?.[state.workspaceId]?.invitation : undefined; }
