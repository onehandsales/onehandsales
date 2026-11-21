import { Link } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
export type HelpOutboundKind = "email" | "feature" | "app" | "video" | "branding";
const destinations = {
  email: { title: "Email support", source: "mailto:support@hellobonsai.com", description: "This preview does not open your mail app or send a message." },
  feature: { title: "Feature Requests", source: "https://bonsai.cnflx.io/", description: "This external feature request destination is available as a local reference only." },
  app: { title: "Chat with us", source: "https://app.hellobonsai.com/vendor/dashboard", description: "Continue to the local app preview. A support chat or conversation will not be created." },
  video: { title: "Client Portal video unavailable", source: "https://www.youtube.com/embed/m1cRQ1aIIrs", description: "The reference includes a video poster, but no local video or captions are available. Playback has not started." },
  branding: { title: "Branding settings", source: "https://app.hellobonsai.com/settings/branding", description: "This historical article links to branding settings. That screen belongs to G16; this preview does not change portal or document branding." },
} as const;
// 기능 : 확인한 외부 목적지와 미제공 영상·후속 설정을 실제 호출 없는 로컬 모달로 안내한다.
export function HelpOutbound({ kind, onClose }: { kind: HelpOutboundKind; onClose: () => void }) {
  const item = destinations[kind];
  return <Dialog title={item.title} description={item.description} onClose={onClose}><p className="help-source-url">Reference destination: {item.source}</p>{kind === "app" && <Link to="/app" onClick={onClose}>Continue to preview app</Link>}<p><button type="button" onClick={onClose}>Back</button></p></Dialog>;
}
