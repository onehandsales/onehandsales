import { CircleCheck, X } from "lucide-react";
import { useMockAuth } from "../data/auth-context";

// 기능 : 실제 세션 폐기와 구분한 현재 탭의 로그아웃/만료 안내를 닫을 수 있게 표시한다.
export function AuthNotice() {
  const { store, state } = useMockAuth(); if (!state.notice) return null;
  return <div className="auth-notice" role="status"><CircleCheck size={18} aria-hidden="true" /><span>{state.notice === "password-reset" ? "Your new password has been set successfully." : state.notice === "signed-out" ? "Signed out successfully." : "Your local session expired. Please log in again."}</span><button type="button" aria-label="Dismiss authentication notice" onClick={store.clearNotice}><X size={20} /></button></div>;
}
