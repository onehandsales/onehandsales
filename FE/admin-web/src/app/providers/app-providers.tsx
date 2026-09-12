import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/features/auth";

type AppProvidersProps = {
  children: ReactNode;
};

// 기능 : AppProviders 컴포넌트를 렌더링합니다.
export function AppProviders({ children }: AppProvidersProps) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
