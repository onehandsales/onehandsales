// 기능 : Backend가 내려준 내부 route를 User Web /app route로 정규화합니다.
export function normalizeInternalAppPath(path: string | null | undefined) {
  // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!path) {
    return "/app";
  }

  // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (path === "/app" || path.startsWith("/app/")) {
    return path;
  }

  // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (path.startsWith("/")) {
    return `/app${path}`;
  }

  // 4. 계산된 결과를 호출자에게 반환한다.
  return "/app";
}
