import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AppI18nProvider } from "@/features/app-i18n";
import { AuthProvider } from "@/features/auth";
import { PublicSiteLanguageProvider } from "@/features/public-site/i18n/public-site-language";
import { queryClient } from "@/lib/query-client";

type AppProvidersProps = {
  children: ReactNode;
};

// 기능 : 앱 전역 provider를 public-site, auth, app i18n, query 순서로 구성합니다.
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PublicSiteLanguageProvider>
      <AuthProvider>
        <AppI18nProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </AppI18nProvider>
      </AuthProvider>
    </PublicSiteLanguageProvider>
  );
}
