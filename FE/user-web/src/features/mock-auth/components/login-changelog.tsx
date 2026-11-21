import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useMockAuth } from "../data/auth-context";
import { loginUpdates, resetUpdates } from "../data/login-content";

// 기능 : 원본에 보이는 업데이트 발췌만 읽게 하고 미수록 상세/외부 사이트는 로컬 안내로 구분한다.
export function LoginChangelog() {
  const [open, setOpen] = useState(false); const { state } = useMockAuth(); const updates = state.loginVariant === "reset" ? resetUpdates : loginUpdates;
  return <><aside className="login-changelog" aria-labelledby="changelog-title"><h2 id="changelog-title">The Changelog</h2><div className="login-changelog-scroll" tabIndex={0} aria-label="Historical changelog excerpts">
    {updates.map(update => <p key={update.title}><span className={update.badge ? "is-improvement" : undefined}>{update.badge ?? "New"}</span> <strong>{update.title}</strong> {update.body}</p>)}
  </div><button type="button" onClick={() => setOpen(true)}>Bonsai updates</button></aside>
    {open && <Dialog title="Historical Bonsai updates" description="These excerpts come from the reference screen. Full update articles and their original destinations were not supplied." onClose={() => setOpen(false)}><p>No external updates service is opened.</p><button type="button" onClick={() => setOpen(false)}>Back to login</button></Dialog>}
  </>;
}
