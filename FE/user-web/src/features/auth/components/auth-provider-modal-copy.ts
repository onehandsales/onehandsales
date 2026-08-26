import type { AuthProviderId } from "@/features/auth/types/auth";
import {
  getPublicSiteCopyLanguage,
  type PublicSiteCopyLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

export type AuthProviderModalCopy = {
  readonly closeLabel: string;
  readonly loadingLabel: string;
  readonly brandGlyph: string;
  readonly brandName: string;
  readonly tagline: string;
  readonly providerLead: string;
  readonly providerLoading: string;
  readonly noProviders: string;
  readonly providersErrorPrefix: string;
  readonly providerFailure: string;
  readonly providerLabels: Record<AuthProviderId, string>;
};

export const authProviderModalCopy: Record<
  PublicSiteCopyLanguage,
  AuthProviderModalCopy
> = {
  ko: {
    closeLabel: "로그인 모달 닫기",
    loadingLabel: "로그인 중",
    brandGlyph: "한",
    brandName: "한손에 영업",
    tagline: "영업을 더 스마트하게",
    providerLead: "소셜 계정으로 간편하게 시작하세요",
    providerLoading: "로그인 수단을 불러오고 있어요.",
    noProviders: "사용할 수 있는 로그인이 없어요.",
    providersErrorPrefix: "로그인 수단을 불러오지 못해 기본 버튼을 보여줘요.",
    providerFailure: "로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.",
    providerLabels: {
      google: "Google로 계속하기",
      line: "LINE으로 계속하기",
      apple: "Apple로 계속하기",
    },
  },  "en-US": {
    closeLabel: "Close sign-in modal",
    loadingLabel: "Signing in",
    brandGlyph: "O",
    brandName: "OneHand",
    tagline: "Smarter sales, faster",
    providerLead: "Start quickly with a social account",
    providerLoading: "Loading sign-in methods.",
    noProviders: "No sign-in methods are available.",
    providersErrorPrefix:
      "Could not load sign-in methods, so default buttons are shown.",
    providerFailure: "We could not complete sign-in. Please try again shortly.",
    providerLabels: {
      google: "Continue with Google",
      line: "Continue with LINE",
      apple: "Continue with Apple",
    },
  },};

export function getAuthProviderContinueLabel({
  language,
  provider,
  providerLabel,
}: {
  readonly language: PublicSiteLanguage;
  readonly provider: AuthProviderId;
  readonly providerLabel: string;
}) {
  const configuredLabel =
    authProviderModalCopy[getPublicSiteCopyLanguage(language)].providerLabels[
      provider
    ];

  if (configuredLabel) {
    return configuredLabel;
  }

  if (language === "ko") {
    return `${providerLabel}로 계속하기`;
  }

  return `Continue with ${providerLabel}`;
}
