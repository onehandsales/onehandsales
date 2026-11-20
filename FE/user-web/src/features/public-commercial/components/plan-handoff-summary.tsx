import type { PublicPlanSelection } from "@/features/public-web";

// 기능 : 공개 가격 선택의 의미와 계산상 소계를 실제 청구 결과와 구분해 인계 경계에 표시한다.
export function PlanHandoffSummary({ selection }: { selection: PublicPlanSelection }) {
  return <div className="plan-handoff-summary">
    <dl><dt>Selected plan</dt><dd>{selection.planName}</dd>
      <dt>Billing cycle</dt><dd>{selection.billing === "yearly" ? "Yearly" : "Monthly"}</dd>
      <dt>Displayed price</dt><dd>${selection.displayedMonthlyAmount} USD / month · {selection.amountMeaning === "annual-monthly-equivalent" ? "연간 결제의 월 환산액" : "월간 가격"}</dd>
      <dt>Price reference</dt><dd>{selection.priceVersion}</dd>
      {selection.derivedAnnualSubtotal !== null && <><dt>Calculated annual subtotal</dt><dd>${selection.derivedAnnualSubtotal} USD = 월 환산액 × 12. 원본에 표시된 청구 총액이 아닙니다.</dd></>}
    </dl><p>과거 시안의 선택 정보입니다. 세금·좌석·추가 상품을 포함한 실제 청구 금액은 확정되지 않았으며 구독·역할·권한은 변경되지 않습니다.</p>
  </div>;
}
