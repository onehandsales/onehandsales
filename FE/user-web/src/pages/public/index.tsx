import { Link } from "react-router-dom";

// 기능 : 기존 앱 대신 새 공개 경계에서 최소 검증 진입점을 제공한다.
export function PublicPage() {
  return <div className="page-content">
    <p className="eyebrow">G01 · Foundation preview</p>
    <h1>OneHand CRM</h1>
    <p className="intro">A local workspace for previewing the new interface.</p>
    <div className="boundary-links">
      <Link className="boundary-link" to="/login"><strong>Workspace preview</strong><span>Choose a sample session</span></Link>
      <Link className="boundary-link" to="/components"><strong>Interface components</strong><span>Buttons, fields and dialogs</span></Link>
      <Link className="boundary-link" to="/share/sample"><strong>Shared preview</strong><span>Open without a session</span></Link>
    </div>
  </div>;
}
