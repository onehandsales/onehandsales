import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HelpOutbound } from "./help-outbound";
import type { HelpOutboundKind } from "./help-outbound";
// 기능 : 당시 도움말 푸터의 앱·메일·제안 목적지를 실제 외부 호출 없이 연결한다.
export function HelpFooter() {
  const [outbound, setOutbound] = useState<HelpOutboundKind | null>(null);
  const location = useLocation();
  // 기능 : 도움말 페이지 이력이 바뀌면 이전 푸터에서 연 목적지 안내를 닫는다.
  useEffect(function closeOnNavigation() { setOutbound(null); }, [location.key]);
  return <footer className="help-footer"><Link to="/help" aria-label="Bonsai Help Center home"><img src="/bonsai-help/asset-00.png" alt="" /></Link><p>© Bonsai 2024</p><nav aria-label="Help footer"><Link to="/app">Back to Bonsai</Link><button type="button" onClick={() => setOutbound("email")}>Email Support</button><button type="button" onClick={() => setOutbound("feature")}>Feature Requests</button></nav>{outbound && <HelpOutbound kind={outbound} onClose={() => setOutbound(null)} />}</footer>;
}
