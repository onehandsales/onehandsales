import { authReturnQuery } from "@/features/preview/model/preview-return-path";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import type { PublicIntent } from "@/features/public-web";
import { useMockAuth } from "../data/auth-context";
import { validateSignup } from "../model/auth-validation";
import type { AuthAccount } from "../model/auth-types";

// 기능 : 가입 초안·검증·취소 가능한 제출을 페이지 수명에 묶고 선택한 인계만 새 세션으로 전달한다.
export function useSignup(intent?: PublicIntent) {
  const { store, state: auth } = useMockAuth(); const { state, runtime } = usePreviewEnvironment(); const navigate = useNavigate(); const location = useLocation();
  const [email, setEmail] = useState(intent?.email ?? ""); const [name, setName] = useState(""); const [password, setPassword] = useState(""); const [captcha, setCaptcha] = useState(false);
  const [focusAttempt, setFocusAttempt] = useState(0);
  const [errors, setErrors] = useState<ReturnType<typeof validateSignup>>({}); const [failure, setFailure] = useState(""); const [pending, setPending] = useState(false);
  const previousRevision = useRef(state.revision);
  const request = useRef<AbortController | null>(null); const composing = useRef(false);
  // 기능 : 취소·편집·페이지 이탈에서 이전 제출의 결과를 무효화한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); }
  // 기능 : 제출 오류가 표시되면 첫 잘못된 입력으로 초점을 옮긴다.
  useEffect(function focusInvalidField() { if (focusAttempt > 0) document.querySelector<HTMLInputElement>(".auth-signup input[aria-invalid=true]")?.focus(); }, [focusAttempt]);
  // 기능 : 이전 세션의 비밀번호·진행 상태를 새 실행 범위에 노출하지 않는다.
  useEffect(function resetScope() { request.current?.abort(); request.current = null; setPending(false); setPassword(""); setCaptcha(false); setFailure(""); if (previousRevision.current !== state.revision) { setName(""); setEmail(""); setErrors({}); } previousRevision.current = state.revision; }, [state.revision]);
  // 기능 : 시나리오 변경과 화면 이탈 뒤 늦은 제출을 폐기한다.
  useEffect(function cancelChangedScenario() { request.current?.abort(); request.current = null; setPending(false); return function abortOnLeave() { request.current?.abort(); }; }, [auth.scenario]);
  // 기능 : 입력 수정은 실패 안내를 지우고 이전 요청을 취소하되 다른 필드를 보존한다.
  function edit(field: "email" | "name" | "password", value: string) { cancel(); setFailure(""); if (field === "email") setEmail(value); else if (field === "name") setName(value); else setPassword(value); setErrors(previous => ({ ...previous, [field]: undefined })); }
  // 기능 : 검증을 통과한 가상 계정만 생성하고 미수록 소셜 분기는 명시적인 샘플 선택을 사용한다.
  async function submit(method: AuthAccount["method"] = "password") {
    if (request.current || composing.current) return;
    const social = method !== "password";
    const submitted = { email: social ? "google-preview@example.test" : email, name: social ? "Google Preview" : name, password, method, intent };
    const validation = validateSignup(submitted.email, submitted.name, social ? "LocalSocial123!" : password, social || captcha);
    setErrors(validation); setFailure(""); if (Object.keys(validation).length) { setFocusAttempt(previous => previous + 1); return; }
    const controller = new AbortController(); request.current = controller; setPending(true);
    try {
      const result = await store.register(submitted, state.revision, controller.signal);
      // 이유 : 성공 commit 자체가 revision을 바꿔 효과에서 취소되더라도 그 계정·차수의 완료 이동은 유효하다.
      const current = runtime.getSnapshot();
      if (result.kind === "session" ? current.revision !== result.committedRevision || current.session?.id !== result.account.id : controller.signal.aborted) return;
      setPassword(""); void navigate((result.kind === "verify-email" ? "/verify-email" : "/onboarding") + authReturnQuery(location.search), { replace: true, state: result.kind === "verify-email" ? location.state : undefined });
    } catch (error) { if (!controller.signal.aborted && !(error instanceof DOMException && error.name === "AbortError")) setFailure(error instanceof Error ? error.message : "Unable to create this local account."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  return { email, name, password, captcha, setCaptcha, errors, failure, pending, composing, edit, submit, cancel };
}
