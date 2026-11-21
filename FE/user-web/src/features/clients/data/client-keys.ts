import type { PreviewScope } from "@/features/preview";
// 기능 : 고객 조회 캐시를 인증 차수·작업공간·저장 버전별로 격리한다.
export function clientKey(scope: PreviewScope, version: number) { return ["mock-clients", scope.actorId, scope.workspaceId, scope.revision, version] as const; }
