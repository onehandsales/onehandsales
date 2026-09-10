# API Spec Convention

- 사용자 업무 API는 `/api/*` 아래에 둔다.
- 관리자 권한 확인은 `/admin/api/me`만 유지한다.
- 인증이 필요한 API는 bearer access token을 요구한다.
- list API는 검색, 필터, 정렬, 페이지네이션 contract를 명시한다.
- detail API는 current user ownership을 검증한다.
- mutation API는 검증 실패, 권한 실패, target 없음 error code를 명확히 반환한다.
- `createdAt`, `updatedAt`, `deletedAt`, `trashExpiresAt`은 UTC ISO string으로 응답한다.
- 파일 export API는 현재 필터 조건을 그대로 반영한다.
