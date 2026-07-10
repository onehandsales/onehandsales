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
    providerLabels: {
      kakao: "Kakao로 계속하기",
      google: "Google로 계속하기",
    },
  },
  ja: {
    closeLabel: "ログインモーダルを閉じる",
    loadingLabel: "ログイン中",
    brandGlyph: "O",
    brandName: "Onehand",
    tagline: "営業をもっとスマートに",
    providerLead: "ソーシャルアカウントで簡単に始めましょう",
    providerLoading: "ログイン方法を読み込んでいます。",
    noProviders: "利用できるログイン方法がありません。",
    providersErrorPrefix:
      "ログイン方法を読み込めないため、既定のボタンを表示しています。",
    providerLabels: {
      kakao: "Kakaoで続行",
      google: "Googleで続行",
    },
  },
  "zh-TW": {
    closeLabel: "关闭登录弹窗",
    loadingLabel: "正在登录",
    brandGlyph: "O",
    brandName: "Onehand",
    tagline: "让销售更智能",
    providerLead: "使用社交账号快速开始",
    providerLoading: "正在加载登录方式。",
    noProviders: "没有可用的登录方式。",
    providersErrorPrefix: "无法加载登录方式，正在显示默认按钮。",
    providerLabels: {
      kakao: "使用 Kakao 继续",
      google: "使用 Google 继续",
    },
  },
  "en-US": {
    closeLabel: "Close sign-in modal",
    loadingLabel: "Signing in",
    brandGlyph: "O",
    brandName: "Onehand",
    tagline: "Smarter sales, faster",
    providerLead: "Start quickly with a social account",
    providerLoading: "Loading sign-in methods.",
    noProviders: "No sign-in methods are available.",
    providersErrorPrefix:
      "Could not load sign-in methods, so default buttons are shown.",
    providerLabels: {
      kakao: "Continue with Kakao",
      google: "Continue with Google",
    },
  },
  "en-GB": {
    closeLabel: "Close sign-in modal",
    loadingLabel: "Signing in",
    brandGlyph: "O",
    brandName: "Onehand",
    tagline: "Smarter sales, faster",
    providerLead: "Start quickly with a social account",
    providerLoading: "Loading sign-in options.",
    noProviders: "No sign-in options are available.",
    providersErrorPrefix:
      "Could not load sign-in options, so default buttons are shown.",
    providerLabels: {
      kakao: "Continue with Kakao",
      google: "Continue with Google",
    },
  },
};

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

  if (language === "ja") {
    return `${providerLabel}で続行`;
  }

  if (language === "zh-TW") {
    return `使用 ${providerLabel} 继续`;
  }

  return `Continue with ${providerLabel}`;
}
