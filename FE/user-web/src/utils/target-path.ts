// 기능 : Backend가 내려준 내부 route를 User Web /app route로 정규화합니다.
export function normalizeInternalAppPath(path: string | null | undefined) {
  if (!path) {
    return "/app";
  }

  if (path === "/app" || path.startsWith("/app/")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `/app${path}`;
  }

  return "/app";
}
