import { authReturnQuery } from "@/features/preview/model/preview-return-path";
import { Link, Outlet, useLocation } from "react-router-dom";
import "@/styles/auth.css";

// 기능 : 공개 탐색·내부 앱과 분리한 인증 전용 헤더·배경·안내를 제공한다.
export function AuthLayout() {
  const { pathname, state, search } = useLocation(); const query = authReturnQuery(search); const reset = pathname.startsWith("/password/"); const signup = pathname === "/signup"; const loginFamily = pathname === "/login" || pathname === "/two-factor" || pathname.startsWith("/password/") || pathname === "/verify-email/request";
  return <div className={"auth-layout" + (loginFamily ? " auth-layout--login" : "") + (reset ? " auth-layout--reset" : "")}><a className="skip-link" href="#main-content">Skip to content</a>
    <header className="auth-header"><Link to="/" aria-label="Bonsai home"><img src={loginFamily ? "/bonsai-auth/symbol.png" : "/bonsai-auth/logo.png"} alt="bonsai" width="112" height="22" /></Link>
      {loginFamily ? <nav aria-label="Authentication"><Link to={"/login" + query} state={state}>Log In</Link><Link to={"/signup" + query} state={state}>Sign Up</Link></nav> : <p>{signup ? "Already have an account?" : "Don't have an account?"} <Link to={(signup ? "/login" : "/signup") + query} state={state}>{signup ? "Log in" : "Sign up"}</Link></p>}</header>
    <main id="main-content" tabIndex={-1}><Outlet /></main>
    <div className="auth-local-notice"><p>Local preview. Use sample details only. No real account is created and no email is sent.</p><Link to="/">Back to landing</Link></div>
  </div>;
}
