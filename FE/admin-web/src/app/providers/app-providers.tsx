import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/features/auth";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
