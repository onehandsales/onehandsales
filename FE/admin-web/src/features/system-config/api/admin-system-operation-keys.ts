// 기능 : Admin 운영 gate React Query key를 생성합니다.
export const adminSystemOperationKeys = {
  all: ["admin", "system-operation"] as const,
  latest: () => [...adminSystemOperationKeys.all, "latest"] as const,
};
