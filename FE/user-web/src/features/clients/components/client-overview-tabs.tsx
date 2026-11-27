import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Copy, ExternalLink, Image, Info, X } from "lucide-react";

// 기능 : 원본의 비활성 포털 설정과 미리보기를 표시하고 미수록 실행은 기존 인계로 연결한다.
export function ClientPortalTab({ onUnavailable }: { onUnavailable: (name: string) => void }) {
  const [bannerVisible, setBannerVisible] = useState(true);
  return <div className="clients-body client-portal">
    {bannerVisible && <div className="client-portal-banner">
      <Info className="client-portal-info" size={20} aria-hidden="true" />
      <button className="client-banner-close" aria-label="Dismiss portal introduction" onClick={() => setBannerVisible(false)}><X size={18} aria-hidden="true" /></button>
      <h2>Connect with Clients</h2>
      <p>Let your clients securely log into a custom-branded portal where they can access the projects, documents and links you’ve shared with them. <button className="client-text-action" onClick={() => onUnavailable("Client Portal")}>Find out more.</button></p>
    </div>}
    <div className="client-portal-columns"><div>
      <h3>Client Portal <button className="client-text-action" onClick={() => onUnavailable("Client Portal preview")}><ExternalLink size={14} aria-hidden="true" />View</button></h3>
      <p>Use this link to share with your clients.</p>
      {/* 이유 : 원본은 축약 URL만 제공하므로 전체 주소를 추정해 복사하거나 외부로 이동하지 않는다. */}
      <button className="client-portal-url" aria-label="Copy client portal link" onClick={() => onUnavailable("Portal link not available")}><span>https://app.hellobonsai.com/u/joe-doe-10/cl...</span><Copy size={16} aria-hidden="true" /></button>
      <h3>Portal Access</h3><p>Enable or disable client access to your portal.</p>
      <div className="client-portal-switch"><button onClick={() => onUnavailable("Enable portal access")}>Enable</button><button aria-pressed="true" onClick={() => onUnavailable("Portal access is disabled")}>Disabled</button></div>
      <h3>Client Portal Header Image</h3><p>Personalize your client portal with your own header image.</p>
      <button className="client-portal-select" onClick={() => onUnavailable("Portal header")}>Custom Header <ChevronDown size={16} aria-hidden="true" /></button>
      <button className="client-portal-upload" onClick={() => onUnavailable("Portal header upload")}><Image size={16} aria-hidden="true" />Upload Image</button>
      <div className="client-portal-brand"><h3>Bonsai Branding <Info size={15} aria-hidden="true" /></h3><button aria-label="Bonsai Branding" aria-pressed="true" onClick={() => onUnavailable("Bonsai Branding")}><span /></button></div>
    </div><div>
      <div className="client-portal-preview" role="img" aria-label="Client portal preview"><div className="client-portal-cover" /><span>JD</span><i /><i /><b /></div>
      <p className="client-portal-caption">Update your color scheme and font in your <Link to="/app/settings/branding">brand settings</Link></p>
    </div></div>
  </div>;
}

// 기능 : 자동화 실행 폼과 구분한 원본 소개 카드의 겹친 예시·잎·장식·문구를 표시한다.
export function ClientAutomationsTab({ onUnavailable }: { onUnavailable: (name: string) => void }) {
  return <div className="clients-body"><section className="client-automation">
    <div className="client-automation-art" role="img" aria-label="Illustration of an example automation">
      <div><h3>New Automation</h3><p>Triggered</p><span>When a contract is signed <ChevronDown size={15} aria-hidden="true" /></span></div>
      <div><h3>Action</h3><span>Schedule a meeting <ChevronDown size={15} aria-hidden="true" /></span></div>
      {/* 이유 : 원본 개별 자산이 없어 윤곽을 재구성하며 원본 SVG 동일성으로 판정하지 않는다. */}
      <svg className="client-automation-leaf" viewBox="0 0 200 100" aria-hidden="true"><path d="M3 6C67 3 125 20 166 69L194 96C178 86 165 78 151 80C87 89 44 58 3 6Z" fill="#80a465" /><path d="M3 6C67 3 125 20 166 69L194 96C127 53 57 24 3 6Z" fill="#61875d" /><path d="m44 31 13 20m12-7 14 20m9-10 18 19m10-6 13 11" stroke="#a4b98b" strokeWidth="3" /></svg>
    </div>
    <div className="client-automation-description"><h2>Workflow Automation</h2><p>Set up custom actions to be performed automatically on your behalf -- from sending welcome emails to requesting client intake forms.</p><button className="client-primary" onClick={() => onUnavailable("New Automation")}>New Automation</button></div>
    <p className="client-automation-support">Have questions? <Link to="/support">Contact Support</Link></p>
  </section></div>;
}
