import { Link } from "react-router-dom";

// 기능 : 잘못된 주소를 조용히 기존 경로로 바꾸지 않고 복귀 링크를 제공한다.
export function NotFoundPage() {
  return <section className="page-content"><h1>Page not found</h1><p>This page is not part of the current preview.</p><Link to="/">Back to public preview</Link></section>;
}
