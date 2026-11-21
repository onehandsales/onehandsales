import { useParams, useSearchParams } from "react-router-dom";
import { HelpArticle, HelpIndex } from "@/features/public-help";
// 기능 : 도움말 경로의 기사 ID와 언어를 해석해 탐색/상세 화면을 조립한다.
export function HelpPage() { const { articleId } = useParams(); const [params] = useSearchParams(); return articleId && (!params.has("lang") || params.get("lang") === "en") ? <HelpArticle key={articleId} id={articleId} /> : <HelpIndex />; }
