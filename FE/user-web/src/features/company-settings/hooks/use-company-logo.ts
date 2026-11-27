import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCompanySetup } from "@/features/company-setup/data/company-context";
import { authDelay } from "@/features/mock-auth/data/auth-delay";
// 기능 : 화면에서만 필요한 파일 URL을 생성하고 교체·이탈 시 항상 해제한다.
export function useLogoUrl(file: File | null) {
  const [url, setUrl] = useState("");
  useEffect(function bindLocalFile() { if (!file) { setUrl(""); return; } const next = URL.createObjectURL(file); setUrl(next); return function revokeLocalFile() { URL.revokeObjectURL(next); }; }, [file]);
  return url;
}
// 기능 : 실제 파일 디코딩과 실패 재시도를 전체 저장과 분리하고 오래된 선택을 폐기한다.
export function useCompanyLogo(onChange: (file: File | null) => void) {
  const location = useLocation();
  const { store, state } = useCompanySetup(); const [pending, setPending] = useState(false); const [error, setError] = useState(""); const lastFile = useRef<File | null>(null); const request = useRef<AbortController | null>(null);
  // 기능 : 제거·취소 시 이전 파일 디코딩이 나중에 미리보기를 되살리지 못하게 한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); setError(""); }
  // 기능 : 컴포넌트와 시나리오 수명을 벗어난 파일 결과를 반영하지 않는다.
  useEffect(function cancelOldFile() { request.current?.abort(); request.current = null; setPending(false); setError(""); lastFile.current = null; return function abortOnLeave() { request.current?.abort(); }; }, [location.key, state.settingsScenario]);
  // 기능 : 허용 형식·크기를 검사한 실제 선택 파일만 로컬 미리보기로 올린다.
  async function select(file: File) {
    cancel(); lastFile.current = file; if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024 || !file.size) { setError("Choose a PNG, JPEG or WebP image up to 2 MB (local preview limit)."); return; }
    const controller = new AbortController(); request.current = controller; setPending(true);
    try {
      await authDelay(state.settingsScenario === "slow" ? 1500 : 180, controller.signal);
      if (store.consumeLogoFailure()) throw new Error("Unable to read this local image. Retry or choose another file.");
      const bitmap = await createImageBitmap(file); bitmap.close(); controller.signal.throwIfAborted(); onChange(file);
    } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof Error ? "Unable to read this local image. Retry or choose another file." : "Unable to read image."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  // 기능 : 재선택 없이 남아 있는 실패 파일의 읽기만 다시 시도한다.
  function retry() { if (lastFile.current) void select(lastFile.current); }
  // 기능 : 선택 파일과 진행을 모두 제거하되 실제 회사 저장은 부모 Save에 맡긴다.
  function remove() { cancel(); lastFile.current = null; onChange(null); }
  return { pending, error, select, retry, remove, cancel };
}
