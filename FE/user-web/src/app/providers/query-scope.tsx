import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 기능 : 공개·내부·공유 경계의 독립된 조회 캐시를 만들고 범위 종료 시 진행 조회를 정리한다.
export function QueryScope({ children }: { children: ReactNode }) {
  // 기능 : 해당 경계에만 속하는 캐시를 한 번 생성한다.
  const [client] = useState(function createQueryClient() { return new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, staleTime: 0 }, mutations: { retry: false } },
  }); });
  // 기능 : 경계가 닫힐 때 실행 중인 조회와 캐시를 함께 정리한다.
  useEffect(function registerQueryLifetime() {
    // 기능 : 폐기된 문맥의 조회가 이후 화면에 재사용되지 않게 한다.
    return function disposeQueries() { void client.cancelQueries(); client.clear(); };
  }, [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
