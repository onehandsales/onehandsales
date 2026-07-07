import { BriefcaseBusiness, CircleHelp, Globe2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type {
  AuthProviderId,
  AuthProviderOption,
} from "@/features/auth/types/auth";
import {
  publicSiteLanguageOptions,
  usePublicSiteLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

type AuthLoginPageProps = {
  readonly authError: string | null;
  readonly enabledProviders: readonly AuthProviderOption[];
  readonly isLoginLoading: boolean;
  readonly isPending: boolean;
  readonly isProvidersLoading: boolean;
  readonly pendingProvider: AuthProviderId | null;
  readonly providersError: string | null;
  readonly onProviderLogin: (provider: AuthProviderId) => void;
};

const providerStyles: Record<AuthProviderId, string> = {
  kakao: "border-[#dededa] bg-white text-[#191919] hover:bg-[#f7f7f5]",
  google: "border-[#dededa] bg-white text-[#191919] hover:bg-[#f7f7f5]",
};

const providerOrder: readonly AuthProviderId[] = ["kakao", "google"];

const loginCopy: Record<
  PublicSiteLanguage,
  {
    readonly homeAria: string;
    readonly title: string;
    readonly subtitle: string;
    readonly providerLead: string;
    readonly providers: Record<AuthProviderId, string>;
    readonly loading: string;
    readonly callbackLoading: string;
    readonly noProviders: string;
    readonly providersErrorPrefix: string;
    readonly signupLead: string;
    readonly signupAction: string;
    readonly termsPrefix: string;
    readonly terms: string;
    readonly termsConnector: string;
    readonly privacy: string;
    readonly termsSuffix: string;
    readonly languagePrefix: string;
    readonly helpAria: string;
  }
> = {
  ko: {
    homeAria: "홈으로 이동",
    title: "나만의 AI 워크스페이스",
    subtitle: "onehand.sales 계정에 로그인",
    providerLead: "다음으로 계속하기",
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "로그인 수단을 불러오는 중입니다.",
    callbackLoading: "로그인 중입니다.",
    noProviders: "사용할 수 있는 로그인이 없어요.",
    providersErrorPrefix: "로그인 수단을 불러오지 못했어요.",
    signupLead: "신규 사용자이신가요?",
    signupAction: "가입하기",
    termsPrefix: "계속 진행하면 ",
    terms: "이용약관",
    termsConnector: " 및 ",
    privacy: "개인정보 처리방침",
    termsSuffix: "에 동의한 것으로 간주됩니다.",
    languagePrefix: "언어:",
    helpAria: "도움말",
  },
  ja: {
    homeAria: "ホームへ移動",
    title: "自分だけのAIワークスペース",
    subtitle: "onehand.sales アカウントにログイン",
    providerLead: "次の方法で続行",
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "ログイン方法を読み込んでいます。",
    callbackLoading: "ログインしています。",
    noProviders: "利用できるログイン方法がありません。",
    providersErrorPrefix: "ログイン方法を読み込めませんでした。",
    signupLead: "初めてご利用ですか？",
    signupAction: "登録",
    termsPrefix: "続行すると、",
    terms: "利用規約",
    termsConnector: "および",
    privacy: "プライバシーポリシー",
    termsSuffix: "に同意したものとみなされます。",
    languagePrefix: "言語:",
    helpAria: "ヘルプ",
  },
  zh: {
    homeAria: "前往首页",
    title: "我的 AI 工作空间",
    subtitle: "登录 onehand.sales 账户",
    providerLead: "使用以下方式继续",
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "正在加载登录方式。",
    callbackLoading: "正在登录。",
    noProviders: "没有可用的登录方式。",
    providersErrorPrefix: "无法加载登录方式。",
    signupLead: "新用户？",
    signupAction: "注册",
    termsPrefix: "继续即表示您同意",
    terms: "服务条款",
    termsConnector: "和",
    privacy: "隐私政策",
    termsSuffix: "。",
    languagePrefix: "语言:",
    helpAria: "帮助",
  },
  "en-US": {
    homeAria: "Go home",
    title: "Your AI workspace",
    subtitle: "Log in to onehand.sales",
    providerLead: "Continue with",
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "Loading sign-in options.",
    callbackLoading: "Signing you in.",
    noProviders: "No sign-in methods are available.",
    providersErrorPrefix: "Could not load sign-in methods.",
    signupLead: "New here?",
    signupAction: "Sign up",
    termsPrefix: "By continuing, you agree to the ",
    terms: "Terms of Use",
    termsConnector: " and the ",
    privacy: "Privacy Policy",
    termsSuffix: ".",
    languagePrefix: "Language:",
    helpAria: "Help",
  },
  "en-GB": {
    homeAria: "Go home",
    title: "Your AI workspace",
    subtitle: "Log in to onehand.sales",
    providerLead: "Continue with",
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "Loading sign-in options.",
    callbackLoading: "Signing you in.",
    noProviders: "No sign-in methods are available.",
    providersErrorPrefix: "Could not load sign-in methods.",
    signupLead: "New here?",
    signupAction: "Sign up",
    termsPrefix: "By continuing, you agree to the ",
    terms: "Terms of Use",
    termsConnector: " and the ",
    privacy: "Privacy Policy",
    termsSuffix: ".",
    languagePrefix: "Language:",
    helpAria: "Help",
  },
};

const providerLogos: Record<AuthProviderId, string> = {
  kakao: "/auth/kakao-logo.svg",
  google: "/auth/google-logo.svg",
};

const providerLogoShellStyles: Record<AuthProviderId, string> = {
  kakao: "bg-transparent",
  google: "bg-white",
};

export function AuthLoginPage({
  authError,
  enabledProviders,
  isLoginLoading,
  isPending,
  isProvidersLoading,
  pendingProvider,
  providersError,
  onProviderLogin,
}: AuthLoginPageProps) {
  const { language } = usePublicSiteLanguage();
  const copy = loginCopy[language];
  const visibleProviders = providerOrder
    .map((providerId) =>
      enabledProviders.find((provider) => provider.provider === providerId)
    )
    .filter((provider): provider is AuthProviderOption => Boolean(provider));

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-white text-[#191919]">
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <section className="w-full max-w-[360px]" aria-labelledby="login-title">
          <div className="grid justify-items-center text-center">
            <Link
              aria-label={copy.homeAria}
              className="grid h-8 w-8 place-items-center rounded-[7px] border-2 border-[#111111] bg-white"
              to="/"
            >
              <BriefcaseBusiness className="h-5 w-5" />
            </Link>

            <h1
              className="mt-6 text-[24px] font-black leading-[1.12] tracking-normal text-[#050505]"
              id="login-title"
            >
              {copy.title}
            </h1>
            <p className="mt-1 text-[23px] font-bold leading-[1.18] tracking-normal text-[#8f8f8b]">
              {copy.subtitle}
            </p>
          </div>

          {isLoginLoading ? (
            <div className="mt-10 flex h-[168px] flex-col items-center justify-center gap-3 text-[13px] font-semibold text-[#777770]">
              <Loader2
                aria-hidden="true"
                className="h-6 w-6 animate-spin text-[#2383e2]"
              />
              {copy.callbackLoading}
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e9e9e7]" />
                <span className="text-[14px] font-medium text-[#8f8f8b]">
                  {copy.providerLead}
                </span>
                <div className="h-px flex-1 bg-[#e9e9e7]" />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {isProvidersLoading ? (
                  <div className="col-span-2 flex h-[74px] items-center justify-center gap-2 rounded-[7px] border border-[#dededa] bg-white text-[13px] font-semibold text-[#777770]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2383e2]" />
                    {copy.loading}
                  </div>
                ) : null}

                {!isProvidersLoading && visibleProviders.length === 0 ? (
                  <div className="col-span-2 rounded-[7px] border border-dashed border-[#dededa] bg-white px-4 py-5 text-center text-[13px] font-semibold text-[#777770]">
                    {copy.noProviders}
                  </div>
                ) : null}

                {visibleProviders.map((provider) => (
                  <button
                    className={[
                      "relative grid h-[74px] place-items-center rounded-[7px] border px-3 py-2 text-[15px] font-semibold shadow-[0_1px_1px_rgba(15,15,15,0.02)] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                      providerStyles[provider.provider],
                    ].join(" ")}
                    disabled={isPending}
                    key={provider.provider}
                    onClick={() => onProviderLogin(provider.provider)}
                    type="button"
                  >
                    {isPending && pendingProvider === provider.provider ? (
                      <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-[#777770]" />
                    ) : null}
                    <span
                      className={[
                        "grid h-7 w-7 place-items-center rounded-[6px]",
                        providerLogoShellStyles[provider.provider],
                      ].join(" ")}
                    >
                      <img
                        alt=""
                        aria-hidden="true"
                        className="h-[22px] w-[22px]"
                        src={providerLogos[provider.provider]}
                      />
                    </span>
                    <span>{copy.providers[provider.provider]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {providersError && visibleProviders.length === 0 ? (
            <p className="mt-5 rounded-[7px] border border-[#f0d9a5] bg-[#fff8e5] px-3 py-2 text-center text-[12px] font-medium leading-5 text-[#8a5d00]">
              {copy.providersErrorPrefix} {providersError}
            </p>
          ) : null}

          {authError ? (
            <p className="mt-5 rounded-[7px] border border-[#f1b6b6] bg-[#fff4f4] px-3 py-2 text-center text-[12px] font-medium leading-5 text-[#a12b2b]">
              {authError}
            </p>
          ) : null}

          <p className="mt-8 text-center text-[15px] font-medium text-[#777770]">
            {copy.signupLead}{" "}
            <span className="text-[#4f4f4b] underline decoration-[#c9c9c5] underline-offset-4">
              {copy.signupAction}
            </span>
          </p>

          <p className="mx-auto mt-7 max-w-[300px] text-center text-[12px] font-medium leading-5 text-[#8f8f8b]">
            {copy.termsPrefix}
            <span className="underline decoration-[#c9c9c5] underline-offset-3">
              {copy.terms}
            </span>
            {copy.termsConnector}
            <span className="underline decoration-[#c9c9c5] underline-offset-3">
              {copy.privacy}
            </span>
            {copy.termsSuffix}
          </p>
        </section>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <LoginLanguageSelect copy={copy} language={language} />
      </div>

      <button
        aria-label={copy.helpAria}
        className="fixed bottom-5 right-5 grid h-5 w-5 place-items-center text-[#b3b3ae] hover:text-[#777770]"
        type="button"
      >
        <CircleHelp className="h-4 w-4" />
      </button>
    </div>
  );
}

function LoginLanguageSelect({
  copy,
  language,
}: {
  readonly copy: (typeof loginCopy)[PublicSiteLanguage];
  readonly language: PublicSiteLanguage;
}) {
  const { setLanguage } = usePublicSiteLanguage();
  const selectedOption = publicSiteLanguageOptions.find(
    (option) => option.value === language
  );

  return (
    <details className="group relative">
      <summary
        className="inline-flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-[6px] px-2 text-[14px] font-medium text-[#777770] hover:bg-[#f7f7f5] [&::-webkit-details-marker]:hidden"
        aria-label={copy.languagePrefix}
      >
        <Globe2 className="h-4 w-4" />
        <span>
          {copy.languagePrefix} {selectedOption?.label ?? "한국어"}
        </span>
      </summary>

      <div className="absolute bottom-10 left-1/2 z-50 w-44 -translate-x-1/2 overflow-hidden rounded-[8px] border border-[#dededa] bg-white p-1 shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
        {publicSiteLanguageOptions.map((option) => (
          <button
            className={[
              "block w-full rounded-[6px] px-3 py-2 text-left text-[12px] font-bold",
              option.value === language
                ? "bg-[#111111] text-white"
                : "text-[#333330] hover:bg-[#f7f7f5]",
            ].join(" ")}
            data-login-language-option={option.value}
            key={option.value}
            onClick={(event) => {
              setLanguage(option.value);
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </details>
  );
}
