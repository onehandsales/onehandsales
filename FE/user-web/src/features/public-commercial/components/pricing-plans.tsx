import { useRef } from "react";
import type { MouseEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { usePublicExperience } from "@/features/public-web";
import { createPlanSelection, pricingPlans, readBillingCycle } from "../data/pricing-data";
import type { BillingCycle, PricingPlan } from "../data/pricing-data";
import { commercialAssets, subscriptionHandoffPath } from "../data/commercial-data";

// 기능 : URL의 월·연 선택과 플랜 카드를 일치시키고 제출 시점의 선택만 로컬 인계한다.
export function PricingPlans() {
  const [search, setSearch] = useSearchParams();
  const billing = readBillingCycle(search.get("billing"));
  const { pathname, search: query } = useLocation();
  const { state } = usePreviewEnvironment();
  const { start } = usePublicExperience();
  const navigate = useNavigate();
  const submitted = useRef(false);
  const destination = state.session ? subscriptionHandoffPath : "/signup";
  // 기능 : 주기 선택을 실제 이력에 남기면서 현재 가격 영역의 스크롤을 유지한다.
  function selectBilling(next: BillingCycle) {
    if (next === billing) return;
    const params = new URLSearchParams(search); params.set("billing", next);
    // 이유 : 같은 프레임의 다음 라디오/CTA가 이전 주기를 읽지 않도록 URL 반영을 즉시 완료한다.
    void setSearch(params, { preventScrollReset: true, flushSync: true });
  }
  // 기능 : 중복 CTA를 막고 플랜·주기·표시 의미의 snapshot을 가입 또는 구독 인계에 전달한다.
  function handlePlan(event: MouseEvent<HTMLAnchorElement>, plan: PricingPlan) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (submitted.current) return;
    submitted.current = true;
    const publicIntentId = start(`pricing-${billing}-${plan.id}`, pathname, false,
      { returnTo: pathname + query, selection: createPlanSelection(plan, billing) });
    void navigate(destination, { state: { publicIntentId } });
  }
  return <>
    <section className="pricing-heading public-container">
      <h1>Pick the best plan for <br />your business</h1>
      <fieldset className="pricing-cycle"><legend className="sr-only">Billing cycle</legend>
        <label className={billing === "monthly" ? "is-selected" : ""}><input type="radio" name="billing" value="monthly" checked={billing === "monthly"} onChange={() => selectBilling("monthly")} />Monthly</label>
        <label className={billing === "yearly" ? "is-selected" : ""}><input type="radio" name="billing" value="yearly" checked={billing === "yearly"} onChange={() => selectBilling("yearly")} />Yearly <span>2 months for free</span></label>
      </fieldset>
    </section>
    <div className="pricing-plans public-container" aria-label="Pricing plans">
      {pricingPlans.map(plan => <article key={plan.id} className={`pricing-plan ${plan.id === "professional" ? "is-recommended" : ""}`} aria-labelledby={`plan-${plan.id}`}>
        {plan.id === "professional" && <div className="pricing-recommendation">{billing === "yearly" ? "Best value for money" : "Most popular"}</div>}
        <div className="pricing-plan-summary"><h2 id={`plan-${plan.id}`}>{plan.name}</h2>
          <p className="pricing-amount" aria-live="polite"><span>$</span> <strong>{billing === "yearly" ? plan.yearlyEquivalent : plan.monthly}</strong> <small>/month</small></p>
          <Link to={destination} onClick={event => handlePlan(event, plan)} className="public-button">Start for free</Link>
          <p className="pricing-description">{plan.description}{billing === "yearly" && <><br />Billed annually.</>}</p>
        </div>
        <ul className="pricing-features">{plan.features.map((feature, index) => <li key={feature}><img src={commercialAssets.check} alt="" width="13" height="9" /><span className={index === 0 && plan.id !== "starter" ? "pricing-included" : ""}>{feature}</span></li>)}</ul>
        <Link to={destination} onClick={event => handlePlan(event, plan)} className="public-button pricing-bottom-cta">Start for free</Link>
      </article>)}
    </div>
  </>;
}
