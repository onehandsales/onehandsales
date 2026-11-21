import type { PublicIntent } from "@/features/public-web";
import { PlanHandoffSummary } from "@/features/public-commercial";
import { TemplateHandoffSummary } from "@/features/public-template";
import { InvoiceHandoffSummary } from "@/features/public-invoice";

// 기능 : 가입 전후 동일하게 선택한 공개 정보만 보여 주며 구독·문서 생성 성공으로 표현하지 않는다.
export function AuthIntentSummary({ intent }: { intent?: PublicIntent }) {
  if (!intent) return null;
  return <aside className="auth-intent" aria-label="Your selected details"><h2>Your selected details</h2>
    <dl><dt>CTA source</dt><dd>{intent.source}</dd><dt>Email draft</dt><dd>{intent.email || "이메일 없이 진입"}</dd></dl>
    {intent.selection && <PlanHandoffSummary selection={intent.selection} />}
    {intent.template && <TemplateHandoffSummary template={intent.template} />}
    {intent.invoice && <InvoiceHandoffSummary invoice={intent.invoice} />}
  </aside>;
}
