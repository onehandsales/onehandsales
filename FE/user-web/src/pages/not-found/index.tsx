import { Link } from "react-router-dom";
import "@/styles/not-found.css";

// 기능 : 잘못된 주소를 조용히 기존 경로로 바꾸지 않고 복귀 링크를 제공한다.
export function NotFoundPage() {
  return <main id="main-content" tabIndex={-1} className="public-not-found"><div><p className="not-found-code">404</p><h1>Oops, the page you're<br className="not-found-break" /> looking for does not exist.</h1><hr /><p>You may want to head back to the homepage.<br />If you think something's broken, report a problem.</p><nav aria-label="Page recovery"><Link to="/">GO TO HOMEPAGE</Link><Link to="/support">REPORT A PROBLEM</Link></nav></div></main>;
}

// 기능 : 내부 잘못된 URL은 흰색 오류 변형으로 표시하며 가상 세션의 앱 홈으로 복구한다.
export function AppNotFoundPage() {
  return <main id="main-content" tabIndex={-1} className="app-not-found"><div><svg width="48" height="60" viewBox="0 0 48 60" aria-hidden="true"><path fill="#333" d="M0 0h31l17 17v43H0z" /><path fill="white" d="M21 19h5v15h-5zm0 20h5v5h-5z" /></svg><h1>Page Not Found</h1><p>The page you are looking for doesn't exist or<br /> has been moved</p><Link to="/app">Go Home</Link></div></main>;
}
