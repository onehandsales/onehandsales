import type { PublicTemplateSelection } from "@/features/public-web";

// 기능 : 공개 선택 정보를 계정 문서 생성·외부 복사 성공과 구분해 인계 화면에 표시한다.
export function TemplateHandoffSummary({ template }: { template: PublicTemplateSelection }) {
  return <section className="template-handoff-summary"><h2>Selected public template</h2><dl><dt>Template</dt><dd>{template.title}</dd><dt>Public ID</dt><dd>{template.id}</dd><dt>Type</dt><dd>{template.type}</dd><dt>Format</dt><dd>{template.format}</dd><dt>Reference</dt><dd>{template.reference}</dd></dl><p>공개 템플릿 선택만 보관했습니다. 계정 문서 복제·파일 편집·메일 발송은 실행하지 않았습니다.</p></section>;
}
