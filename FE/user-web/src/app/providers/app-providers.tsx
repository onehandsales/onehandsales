import { createTeamStore, TeamContext } from "@/features/team";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { PreviewContext } from "@/features/preview/data/preview-context";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { PublicProvider } from "@/features/public-web";
import { createAuthStore, AuthContext } from "@/features/mock-auth";
import { createCompanyStore } from "@/features/company-setup/data/create-company-store";
import { CompanyContext } from "@/features/company-setup/data/company-context";
import { InvoiceProvider } from "@/features/public-invoice";

// 기능 : 새 앱 전체에 로컬 목 공급자만 조립하고 브라우저 새로고침마다 seed를 새로 만든다.
export function AppProviders({ children }: { children: ReactNode }) {
  const [runtime] = useState(createPreviewRuntime);
  const [team] = useState(() => createTeamStore(runtime));
  // 기능 : 팀 저장소의 문맥 구독을 앱 수명에 연결한다.
  useEffect(function connectTeamScope() { return team.connect(); }, [team]);
  const [auth] = useState(() => createAuthStore(runtime));
  const [company] = useState(() => createCompanyStore(runtime, auth));
  // 기능 : 회사 초안과 저장 결과의 문맥 구독을 앱 수명에 연결한다.
  useEffect(function connectCompanyScope() { return company.connect(); }, [company]);
  // 기능 : 가상 인증 저장소의 실행 문맥 구독을 앱 수명에 연결한다.
  useEffect(function connectAuthScope() { return auth.connect(); }, [auth]);
  const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot);
  return <PreviewContext.Provider value={{ runtime, state }}><AuthContext.Provider value={auth}><CompanyContext.Provider value={company}><TeamContext.Provider value={team}><PublicProvider resetRevision={state.revision}><InvoiceProvider resetRevision={state.revision}>{children}</InvoiceProvider></PublicProvider></TeamContext.Provider></CompanyContext.Provider></AuthContext.Provider></PreviewContext.Provider>;
}
