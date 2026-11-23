import type { PublicPlanSelection } from "@/features/public-web";

export type BillingCycle = PublicPlanSelection["billing"];
export type PlanId = PublicPlanSelection["planId"];
export type PricingPlan = { id: PlanId; name: string; monthly: number; yearlyEquivalent: number; description: string; features: string[]; featureNotes?: Record<string, string> };
// 근거 : Gummble Pricing 01~03 + 공식 pricing 2024-01-18 08:27:27 보관본. 현재 요금 정책이 아니다.
export const priceVersion = "bonsai-public-legacy-20240118-catalog2146";
export const pricingPlans: PricingPlan[] = [
  { id: "starter", name: "Starter", monthly: 25, yearlyEquivalent: 21,
    description: "Ideal for freelancers and contractors just starting out.",
    features: ["All Templates", "Unlimited Clients & Projects", "Invoicing & Payments", "Proposal & Contracts", "Scheduling", "Tasks & Time Tracking", "Client CRM", "Forms & Questionnaires", "Expense Tracking"] },
  { id: "professional", name: "Professional", monthly: 39, yearlyEquivalent: 32,
    description: "Everything a growing independent business needs to thrive.",
    features: ["Everything in Starter, plus:", "Remove Bonsai Branding", "Workflow Automations", "Branded Client Portal", "Unlimited Scheduling Events", "QuickBooks Integration", "Calendly Integration", "Zapier Integration"] },
  { id: "business", name: "Business", monthly: 79, yearlyEquivalent: 66,
    description: "The perfect package for small businesses and agencies.",
    features: ["Everything in Professional, plus:", "Subcontractor Management", "Hiring Agreement Templates", "Subcontractor Onboarding", "Talent Pool", "Unlimited Subcontractors"],
    featureNotes: { "Hiring Agreement Templates": "(1099 contractors)" } },
];

// 기능 : URL의 미확인 주기 값을 원본 첫 화면의 Yearly로 정규화한다.
export function readBillingCycle(value: string | null): BillingCycle { return value === "monthly" ? "monthly" : "yearly"; }

// 기능 : 표시액과 계산상 연간 소계를 구분한 플랜 선택을 인계 시점에 고정한다.
export function createPlanSelection(plan: PricingPlan, billing: BillingCycle): PublicPlanSelection {
  const yearly = billing === "yearly";
  return { planId: plan.id, planName: plan.name, billing, priceVersion, currency: "USD",
    displayedMonthlyAmount: yearly ? plan.yearlyEquivalent : plan.monthly,
    amountMeaning: yearly ? "annual-monthly-equivalent" : "monthly-price",
    derivedAnnualSubtotal: yearly ? plan.yearlyEquivalent * 12 : null };
}
