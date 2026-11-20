import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { PublicLink, SignupForm, SignupLink, ReviewRating } from "@/features/public-web";
import { introductionAssets } from "../data/introduction-data";
import type { IntroductionContent } from "../data/introduction-data";

// 기능 : 외부 예약을 호출하지 않는 데모 인계 상태와 닫기·초점 복귀를 제공한다.
function DemoLink() {
  const [open, setOpen] = useState(false);
  return <><button type="button" className="public-button intro-outline" onClick={() => setOpen(true)}>Book a demo</button>
    {open && <Dialog title="Book a demo" onClose={() => setOpen(false)}>
      <p>데모 예약 화면은 아직 제공되지 않습니다. 이 미리보기에서는 예약이나 이메일을 전송하지 않습니다.</p>
      <button type="button" className="public-button" onClick={() => setOpen(false)}>Back to introduction</button>
    </Dialog>}</>;
}

// 기능 : 원본 고객군 탐색과 소개별 제목·이메일 또는 CTA·정적 홍보 이미지를 조립한다.
export function IntroductionHero({ page }: { page: IntroductionContent }) {
  const crm = page.id === "crm";
  return <>
    <nav className="public-audiences public-wide" aria-label="Business types">
      <PublicLink href="/software/small-businesses">Small businesses</PublicLink>
      <PublicLink href="/software/agencies">Agencies</PublicLink>
      <PublicLink href="/software/freelancing">Freelancers</PublicLink>
    </nav>
    <section className={`intro-hero ${crm ? "intro-crm-hero" : ""}`}>
      <img className="intro-hero-branch" src={introductionAssets.branch} alt="" />
      <div className="public-container intro-hero-grid">
        <div className="intro-hero-copy"><h1>{page.title}</h1><p>{page.description}</p>
          {page.id === "small-businesses" ? <div className="intro-hero-actions"><SignupLink source="small-businesses-hero">Start free</SignupLink><DemoLink /></div>
            : <SignupForm source={`${page.id}-email`} placeholder="Enter your work email" />}
          <ReviewRating compact />
        </div>
        <div className="intro-hero-art">
          <img className="intro-hero-image" src={page.heroImage} alt={crm ? "Illustration of a project board, not an interactive workspace" : "Business owner"} />
          {!crm && <img className="intro-hero-leaf" src={introductionAssets.leaf} alt="" />}
          {page.notifications.map((notice, index) => <div className={`public-notice intro-notice intro-notice-${index}`} key={notice.label}>
            <img src={notice.icon} alt="" /><div><span>{notice.label}</span><strong>{notice.value}</strong></div>
          </div>)}
        </div>
      </div>
    </section>
  </>;
}
