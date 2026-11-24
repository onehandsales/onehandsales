import { createContext, useContext } from "react";
import type { InvoiceDraft } from "@/features/public-invoice";
import type { PublicOrigin } from "../model/public-origin";

// 의미 : 공개 가격 시안의 선택 snapshot이며 실제 구독·청구·권한 계약이 아니다.
export type PublicPlanSelection = Readonly<{
  planId: "starter" | "professional" | "business";
  planName: string;
  billing: "monthly" | "yearly";
  priceVersion: string;
  currency: "USD";
  displayedMonthlyAmount: number;
  amountMeaning: "monthly-price" | "annual-monthly-equivalent";
  derivedAnnualSubtotal: number | null;
}>;
// 의미 : 공개 카탈로그 선택이며 계정 문서의 복제본이나 서버 template ID가 아니다.
export type PublicTemplateSelection = Readonly<{ id: string; title: string; path: string; type: string; format: string; reference: string }>;
export type PublicIntentOptions = { returnTo?: string; returnOrigin?: PublicOrigin; selection?: PublicPlanSelection; template?: PublicTemplateSelection; invoice?: InvoiceDraft };
export type PublicIntent = { source: string; email: string; sourcePath: string; returnTo: string; returnOrigin?: PublicOrigin; selection?: PublicPlanSelection; template?: PublicTemplateSelection; invoice?: InvoiceDraft };
export type PublicExperience = {
  scope: string;
  emails: Readonly<Record<string, string>>;
  intents: Readonly<Record<string, PublicIntent>>;
  setEmail: (path: string, email: string) => void;
  start: (source: string, path: string, includeEmail?: boolean, options?: PublicIntentOptions) => string;
  restore: (intent: PublicIntent) => string;
  clear: (intentId: string | undefined) => void;
};
export const PublicContext = createContext<PublicExperience | null>(null);

// 기능 : 공개 입력과 가입 인계의 단일 메모리 상태를 소비한다.
export function usePublicExperience() {
  const value = useContext(PublicContext);
  if (!value) throw new Error("Public experience provider is missing");
  return value;
}
