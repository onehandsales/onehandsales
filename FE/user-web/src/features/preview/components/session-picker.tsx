import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePreviewEnvironment } from "../data/preview-context";
import type { ActorId } from "../model/preview-types";
import { previewReturnPath } from "../model/preview-return-path";

// 기능 : 계정 정보를 요구하지 않고 두 가상 사용자 중 하나로 내부 미리보기에 진입한다.
export function SessionPicker() {
  const { runtime } = usePreviewEnvironment();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // 기능 : 가상 세션을 열고 요청한 내부 경로로 복귀한다.
  function handleChoose(actor: ActorId) {
    runtime.setSession(actor);
    void navigate(previewReturnPath(params.get("returnTo")), { replace: true });
  }
  return <div className="session-options">
    <Button onClick={() => handleChoose("preview-a")}>Continue as Alex</Button>
    <Button variant="secondary" onClick={() => handleChoose("preview-b")}>Continue as Blair</Button>
  </div>;
}
