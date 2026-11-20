import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { SignupLink, usePublicExperience } from "@/features/public-web";
import { commercialAssets, reviewCards, reviewDestinations } from "../data/commercial-data";

// 기능 : 확인된 후기 외부 주소를 실제 외부 호출 없이 로컬 안내 화면에 인계한다.
function ReviewLink({ id, children, label, className }: { id: string; children: ReactNode; label?: string; className?: string }) {
  const { start } = usePublicExperience();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const submitted = useRef(false);
  const destination = reviewDestinations.find(item => item.id === id);
  if (!destination) return <>{children}</>;
  const path = destination.path;
  // 기능 : 일반 클릭의 출처를 한 번만 보관하고 새 탭은 독립적인 안내로 연다.
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (submitted.current) return;
    submitted.current = true;
    const publicIntentId = start(`reviews-${id}`, pathname);
    void navigate(path, { state: { publicIntentId } });
  }
  return <Link to={path} onClick={handleClick} aria-label={label} className={className}>{children}</Link>;
}

// 기능 : 과거 후기 제목·홍보 수치·평점 자산과 가입·후기 출처의 로컬 진입을 제공한다.
export function ReviewsHero() {
  return <section className="reviews-heading public-container">
    <h1>What Bonsai customers say</h1>
    <p>500,000+ business owners and professionals <br />choose Bonsai to grow their business. Here’s why.</p>
    <div className="reviews-ratings">
      <ReviewLink id="g2" label="Bonsai reviews on G2"><img src={commercialAssets.g2} alt="G2: five stars, Top performer" /></ReviewLink>
      <ReviewLink id="capterra" label="Bonsai reviews on Capterra"><img src={commercialAssets.capterra} alt="Capterra: Best app for entrepreneurs, 4.7" /></ReviewLink>
    </div>
    <SignupLink source="reviews-hero">Start free</SignupLink>
  </section>;
}

// 기능 : 원본 포스터를 보여 주고 확보하지 못한 영상은 명시적인 미제공 모달로 안내한다.
export function ReviewVideo() {
  const [open, setOpen] = useState(false);
  return <section className="review-video public-container" aria-label="Customer video">
    <button type="button" className="review-video-poster" aria-label="Open customer video" onClick={() => setOpen(true)}>
      <img className="review-poster-image" src={commercialAssets.poster} alt="Mary Mitchell customer interview poster" width="1400" height="788" />
      <img className="review-play" src={commercialAssets.play} alt="" width="60" height="60" />
    </button>
    {open && <Dialog title="Customer video unavailable" onClose={() => setOpen(false)}>
      <p>이 미리보기에는 영상 파일과 자막이 제공되지 않습니다. 포스터만 확인할 수 있으며 외부 플레이어는 열지 않습니다.</p>
      <button type="button" className="public-button" onClick={() => setOpen(false)}>Back to reviews</button>
    </Dialog>}
  </section>;
}

// 기능 : 관찰·보관본으로 확인한 후기의 이름·직무·본문·순서를 정적 카드로 재현한다.
export function ReviewGrid() {
  return <section className="review-section public-container">
    <h2>Bonsai helps business owners <br />across all types of industries</h2>
    <div className="review-grid">{reviewCards.map(card => <article className="review-card" id={card.id} key={card.id}>
      <h3>{card.name}, {card.sourceHref ? <ReviewLink id={card.id}>{card.role}</ReviewLink> : <span>{card.role}</span>}</h3>
      <p>{card.text}</p>
    </article>)}</div>
  </section>;
}
