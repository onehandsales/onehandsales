import { useState } from "react";
import { Link } from "react-router-dom";
import type { FormEvent } from "react";
import type { TeamRow } from "@/features/team";
import type { useInvitation } from "../hooks/use-invitation";
// 기능 : 원본의 고정 초대 이메일과 별도 계정 입력을 일반 가입 화면과 구분해 표시한다.
export function InvitationForm({ target, form }: { target: TeamRow; form: ReturnType<typeof useInvitation> }) {
  const [avatarVisible, setAvatarVisible] = useState(true);
  // 기능 : 한글 조합 중 Enter를 제출로 해석하지 않고 로컬 입력을 검사한다.
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); form.accept(); }
  const initials = (form.name || target.name).split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
  return <><div className={`invitation-avatar${avatarVisible ? "" : " is-empty"}`}><span aria-hidden="true">{avatarVisible ? initials : ""}</span><button type="button" aria-label={avatarVisible ? "Remove profile initials" : "Restore profile initials"} onClick={() => setAvatarVisible(!avatarVisible)}>{avatarVisible ? "×" : "+"}</button></div><p className="invitation-target">Complete your account for<br /><strong>{target.email}</strong></p><div className="invitation-divider" />
    {form.account && !form.matches ? <div className="invitation-fields"><h2>Invitation email does not match</h2><p>You are signed in as {form.account.email}. Sign out to continue with the invited email.</p><button type="button" className="invitation-primary" disabled={form.pending} onClick={form.signOut}>Sign out and continue</button>{form.error && <p role="alert">{form.error}</p>}</div> : <form className="invitation-fields" onSubmit={submit} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }}>
      {form.matches ? <p>Accept as {form.account?.name}</p> : <><label htmlFor="invited-name">Full Name</label><input id="invited-name" aria-describedby={form.error ? "invitation-error" : undefined} aria-invalid={!!form.error} autoComplete="name" maxLength={100} placeholder="Jane Smith" value={form.name} onChange={event => form.setName(event.currentTarget.value)} required disabled={form.pending} /><label htmlFor="invited-password">Password</label><input id="invited-password" aria-describedby={form.error ? "invitation-error" : undefined} aria-invalid={!!form.error} type="password" autoComplete="new-password" placeholder="Password" maxLength={128} value={form.password} onChange={event => form.setPassword(event.currentTarget.value)} required disabled={form.pending} /></>}
      <button className="invitation-primary" type="submit" disabled={form.pending}>{form.pending ? "Accepting…" : "Accept Invitation"}</button>{form.error && <p role="alert" className="auth-error" id="invitation-error">{form.error}</p>}
    </form>}
    <p className="invitation-terms">By creating an account,<br />you accept our <Link to="/legal/terms">Terms &amp; Conditions</Link>.</p>

  </>;
}
