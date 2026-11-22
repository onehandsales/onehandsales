import { Link } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import "@/styles/collaboration.css";
// 기능 : 초대 협업자의 계정 표시를 유지하고 회사·팀·구독 설정은 제한한다.
export function CollaborationPage() { const { state } = usePreviewEnvironment(); return <section className="collaboration-body"><h1>Account settings</h1><p>{state.session?.name}</p><p>This local invitation role can view its account name. Company, team, subscription and financial settings are unavailable.</p><Link to="/app/projects">Return to projects</Link></section>; }
