import { useLogoUrl } from "@/features/company-settings/hooks/use-company-logo";
import type { BrandDraft } from "../model/branding-types";
// 기능 : 편집 초안의 헤더·로고만 즉시 표시하고 실제 문서 생성·청구·결제를 수행하지 않는다.
export function SampleInvoice({ draft }: { draft: BrandDraft }) {
  const logo = useLogoUrl(draft.logo); const header = draft.defaults.header;
  return <section className="brand-preview" aria-label="Brand Preview"><h3>Brand Preview</h3><div className={"sample-invoice has-" + header} data-header={header}>
    <div className="sample-invoice-heading"><div className="sample-invoice-header" aria-label={header === "none" ? "No header image" : header + " header preview"} />
      <p className="sample-invoice-number">INVOICE # <strong>1001</strong></p><div className="sample-invoice-logo">{logo && <img src={logo} alt="Company logo preview" />}</div><h2>Sample Invoice</h2>
    </div><div className="sample-invoice-body"><div className="sample-parties"><p><span>FROM</span>Joe Doe</p><p><span>TO</span>Sample Client</p></div><span className="sample-pay" aria-label="Pay Invoice — visual sample only">Pay Invoice</span></div>
  </div></section>;
}
