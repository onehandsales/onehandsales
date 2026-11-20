import { useQuery } from "@tanstack/react-query";
import { usePreviewEnvironment } from "../data/preview-context";

// 기능 : 내부 사용자 키와 무관한 공유 자료를 별도 캐시에서 조회한다.
export function useSharedPreview(shareId: string) {
  const { runtime } = usePreviewEnvironment();
  return useQuery({ queryKey: ["shared-preview", shareId], queryFn: ({ signal }) => runtime.source.shared(shareId, signal) });
}
