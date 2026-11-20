import { Link } from "react-router-dom";
import { SessionPicker } from "@/features/preview";

// 기능 : 실제 로그인 양식 없이 가상 세션 진입과 취소 경계만 제공한다.
export function LoginPage() {
  return <section className="auth-preview">
    <p className="eyebrow">Local preview</p><h1>Choose a preview session</h1>
    <p>No account or password needed. The Bonsai login screen is pending G11.</p><SessionPicker />
    <Link to="/">Back to public preview</Link>
  </section>;
}
