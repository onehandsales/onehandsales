import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { previewReturnPath } from "@/features/preview/model/preview-return-path";
import type { PublicIntent } from "@/features/public-web";
import { useMockAuth } from "../data/auth-context";
import type { AuthAccount, LoginInput } from "../model/auth-types";

// 기능 : 같은 가상 계정의 로그인 입력·실패·취소와 안전한 목적지 복귀를 관리한다.
export function useLogin(intent?: PublicIntent) {
  const { runtime, state: preview } = usePreviewEnvironment(); const { store, state } = useMockAuth(); const location = useLocation(); const navigate = useNavigate(); const [params] = useSearchParams();
  const [email, setEmail] = useState(location.state?.resetCompleted ? "" : intent?.email ?? ""); const [password, setPassword] = useState(""); const [captcha, setCaptcha] = useState(false); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  const request = useRef<AbortController | null>(null); const composing = useRef(false); const previousRevision = useRef(preview.revision);
  // 기능 : 폼 이탈·취소 뒤 이전 인증 결과를 반영하지 않는다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); }
  // 기능 : 외부 실행 문맥이 바뀌면 다른 사용자에게 자격정보를 노출하지 않는다.
  useEffect(function clearScope() { request.current?.abort(); request.current = null; setPending(false); setPassword(""); setCaptcha(false); if (previousRevision.current !== preview.revision) setEmail(""); previousRevision.current = preview.revision; }, [preview.revision]);
  // 기능 : 시나리오 변경·이탈에서 진행 중 로그인을 취소한다.
  useEffect(function cancelScenario() { request.current?.abort(); request.current = null; setPending(false); return function abortOnLeave() { request.current?.abort(); }; }, [state.scenario]);
  // 기능 : 수정한 필드를 보존하며 이전 제출을 무효화한다.
  function edit(field: "email" | "password", value: string) { cancel(); setError(""); if (field === "email") setEmail(value); else setPassword(value); }
  // 기능 : 로컬 체크의 만료를 재현해 재선택 없이는 로그인하지 못하게 한다.
  function expireCaptcha() { cancel(); setCaptcha(false); setError("The local preview check expired. Select it again."); }
  // 기능 : 실제 인증 없이 같은 계정 저장소로 검증하고 2FA·온보딩·의도한 앱 경로를 구별한다.
  async function submit(method: AuthAccount["method"] = "password", sample?: "alex" | "blair") {
    if (request.current || composing.current) return;
    const input: LoginInput = { email: sample ? `${sample}@example.test` : email, password: sample ? "PreviewOnly123!" : password, method, captcha: sample !== undefined || method !== "password" || captcha, intent, returnTo: previewReturnPath(params.get("returnTo")) };
    if (sample) { setEmail(input.email); setPassword(input.password); setCaptcha(true); }
    setError(""); store.clearNotice();
    if (method === "password" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) { setError("Enter a valid email address."); document.getElementById("login-email")?.focus(); return; }
    if (method === "password" && !input.password) { setError("Enter a sample password."); document.getElementById("login-password")?.focus(); return; }
    if (!input.captcha) { setError("Complete the local preview check."); document.querySelector<HTMLInputElement>(".auth-login input[type=checkbox]")?.focus(); return; }
    const controller = new AbortController(); request.current = controller; setPending(true);
    try {
      const result = await store.login(input, preview.revision, controller.signal); const current = runtime.getSnapshot();
      if (current.revision !== result.committedRevision || (result.kind === "session" ? current.session?.id !== result.account.id : controller.signal.aborted)) return;
      setPassword(""); const to = result.kind === "two-factor" ? "/two-factor" : !result.account.setupComplete ? "/onboarding" + (result.returnTo === "/app" ? "" : "?returnTo=" + encodeURIComponent(result.returnTo)) : intent ? "/auth/continue" : result.returnTo;
      void navigate(to, { replace: true, state: result.kind === "two-factor" ? location.state : { authRevision: result.committedRevision, actorId: result.account.id } });
    } catch (failure) { if (!controller.signal.aborted && !(failure instanceof DOMException && failure.name === "AbortError")) setError(failure instanceof Error ? failure.message : "Unable to log in locally."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return { email, password, captcha, setCaptcha, error, pending, composing, edit, submit, cancel, expireCaptcha };
}
