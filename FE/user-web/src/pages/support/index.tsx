import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CommercialAudiences } from "@/features/public-commercial";
import { helpArticlePath, helpFaqLinks, HelpOutbound } from "@/features/public-help";
import type { HelpOutboundKind } from "@/features/public-help";
import "@/styles/public-help.css";
// 기능 : 접수 폼 없이 원본의 지원 채널·FAQ 링크를 로컬 도움말과 가상 앱으로 연결한다.
export function SupportPage() {
  const [outbound, setOutbound] = useState<HelpOutboundKind | null>(null);
  const location = useLocation();
  // 기능 : 문의 페이지의 새 이력이나 뒤로 복귀에서 이전 지원 안내를 닫는다.
  useEffect(function closeOnNavigation() { setOutbound(null); }, [location.key]);
  return <><CommercialAudiences /><div className="support-page"><section className="support-hero"><h1>How can we help?</h1><p>Get in touch with us or search for answers in our help<br className="support-desktop-break" /> center.</p></section><section className="support-channels" aria-label="Support channels"><article><img src="/bonsai-public/635ea64cc7a1a7fca876b7cc_Send.svg" alt="" /><h2>Send us an email</h2><p>Reach us at<br />support@hellobonsai.com.</p><button type="button" onClick={() => setOutbound("email")}>Email us</button></article><article><img src="/bonsai-help/support-chat.svg" alt="" /><h2>Chat with us</h2><p>Use the in-app chat on the bottom right to get in touch quickly.</p><button type="button" onClick={() => setOutbound("app")}>Go to the app</button></article><article><img src="/bonsai-help/support-help.svg" alt="" /><h2>Help Center</h2><p>Browse through our documentation and customer's frequent questions.</p><Link to="/help">Visit our help center</Link></article></section><section className="support-faq"><img className="support-branch" src="/bonsai-help/support-branch.webp" alt="" /><div><h2>Frequently asked questions</h2><ul>{helpFaqLinks.map(item => <li key={item.id}><Link to={helpArticlePath(item.id)} state={{ supportOrigin: location.pathname + location.search + location.hash, helpReturnState: location.state }}>{item.label}</Link></li>)}</ul></div></section></div>{outbound && <HelpOutbound kind={outbound} onClose={() => setOutbound(null)} />}</>;
}
