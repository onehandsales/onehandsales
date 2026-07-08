import { Globe2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { OnehandLogoMark } from "@/components/brand/onehand-logo-mark";
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
  readonly mode: AuthPageMode;
  readonly pendingProvider: AuthProviderId | null;
  readonly providersError: string | null;
  readonly onProviderLogin: (provider: AuthProviderId) => void;
};

type AuthPageMode = "login" | "signup";

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
    readonly subtitles: Record<AuthPageMode, string>;
    readonly providerLead: Record<AuthPageMode, string>;
    readonly providers: Record<AuthProviderId, string>;
    readonly loading: string;
    readonly callbackLoading: string;
    readonly noProviders: string;
    readonly providersErrorPrefix: string;
    readonly switchLead: Record<AuthPageMode, string>;
    readonly switchAction: Record<AuthPageMode, string>;
    readonly termsPrefix: string;
    readonly terms: string;
    readonly termsConnector: string;
    readonly privacy: string;
    readonly termsSuffix: string;
    readonly languagePrefix: string;
  }
> = {
  ko: {
    homeAria: "홈으로 이동",
    title: "나만의 AI 워크스페이스",
    subtitles: {
      login: "Onehand 계정에 로그인",
      signup: "Onehand 계정 만들기",
    },
    providerLead: {
      login: "다음으로 계속하기",
      signup: "또는 다음으로 계속하기",
    },
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "로그인 수단을 불러오는 중입니다.",
    callbackLoading: "로그인 중입니다.",
    noProviders: "사용할 수 있는 로그인이 없어요.",
    providersErrorPrefix: "로그인 수단을 불러오지 못했어요.",
    switchLead: {
      login: "신규 사용자이신가요?",
      signup: "기존 사용자이신가요?",
    },
    switchAction: {
      login: "가입하기",
      signup: "로그인하기",
    },
    termsPrefix: "계속 진행하면 ",
    terms: "이용약관",
    termsConnector: " 및 ",
    privacy: "개인정보 처리방침",
    termsSuffix: "에 동의한 것으로 간주됩니다.",
    languagePrefix: "언어:",
  },
  ja: {
    homeAria: "ホームへ移動",
    title: "自分だけのAIワークスペース",
    subtitles: {
      login: "Onehand アカウントにログイン",
      signup: "Onehand アカウントを作成",
    },
    providerLead: {
      login: "次の方法で続行",
      signup: "または次の方法で続行",
    },
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "ログイン方法を読み込んでいます。",
    callbackLoading: "ログインしています。",
    noProviders: "利用できるログイン方法がありません。",
    providersErrorPrefix: "ログイン方法を読み込めませんでした。",
    switchLead: {
      login: "初めてご利用ですか？",
      signup: "既にアカウントをお持ちですか？",
    },
    switchAction: {
      login: "登録",
      signup: "ログイン",
    },
    termsPrefix: "続行すると、",
    terms: "利用規約",
    termsConnector: "および",
    privacy: "プライバシーポリシー",
    termsSuffix: "に同意したものとみなされます。",
    languagePrefix: "言語:",
  },
  zh: {
    homeAria: "前往首页",
    title: "我的 AI 工作空间",
    subtitles: {
      login: "登录 Onehand 账户",
      signup: "创建 Onehand 账户",
    },
    providerLead: {
      login: "使用以下方式继续",
      signup: "或使用以下方式继续",
    },
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "正在加载登录方式。",
    callbackLoading: "正在登录。",
    noProviders: "没有可用的登录方式。",
    providersErrorPrefix: "无法加载登录方式。",
    switchLead: {
      login: "新用户？",
      signup: "已有账户？",
    },
    switchAction: {
      login: "注册",
      signup: "登录",
    },
    termsPrefix: "继续即表示您同意",
    terms: "服务条款",
    termsConnector: "和",
    privacy: "隐私政策",
    termsSuffix: "。",
    languagePrefix: "语言:",
  },
  "en-US": {
    homeAria: "Go home",
    title: "Your AI workspace",
    subtitles: {
      login: "Log in to Onehand",
      signup: "Create your Onehand account",
    },
    providerLead: {
      login: "Continue with",
      signup: "Continue with",
    },
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "Loading sign-in options.",
    callbackLoading: "Signing you in.",
    noProviders: "No sign-in methods are available.",
    providersErrorPrefix: "Could not load sign-in methods.",
    switchLead: {
      login: "New here?",
      signup: "Already have an account?",
    },
    switchAction: {
      login: "Sign up",
      signup: "Log in",
    },
    termsPrefix: "By continuing, you agree to the ",
    terms: "Terms of Use",
    termsConnector: " and the ",
    privacy: "Privacy Policy",
    termsSuffix: ".",
    languagePrefix: "Language:",
  },
  "en-GB": {
    homeAria: "Go home",
    title: "Your AI workspace",
    subtitles: {
      login: "Log in to Onehand",
      signup: "Create your Onehand account",
    },
    providerLead: {
      login: "Continue with",
      signup: "Continue with",
    },
    providers: {
      kakao: "Kakao",
      google: "Google",
    },
    loading: "Loading sign-in options.",
    callbackLoading: "Signing you in.",
    noProviders: "No sign-in methods are available.",
    providersErrorPrefix: "Could not load sign-in methods.",
    switchLead: {
      login: "New here?",
      signup: "Already have an account?",
    },
    switchAction: {
      login: "Sign up",
      signup: "Log in",
    },
    termsPrefix: "By continuing, you agree to the ",
    terms: "Terms of Use",
    termsConnector: " and the ",
    privacy: "Privacy Policy",
    termsSuffix: ".",
    languagePrefix: "Language:",
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
  mode,
  pendingProvider,
  providersError,
  onProviderLogin,
}: AuthLoginPageProps) {
  const { language } = usePublicSiteLanguage();
  const copy = loginCopy[language];
  const switchPath = mode === "login" ? "/signup" : "/login";
  const visibleProviders = providerOrder
    .map((providerId) =>
      enabledProviders.find((provider) => provider.provider === providerId)
    )
    .filter((provider): provider is AuthProviderOption => Boolean(provider));

  if (isLoginLoading || isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-white text-[#191919]">
        <Loader2
          aria-label={copy.callbackLoading}
          className="h-7 w-7 animate-spin text-[#2383e2]"
          role="status"
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-white text-[#191919]">
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <section className="w-full max-w-[360px]" aria-labelledby="login-title">
          <div className="grid justify-items-center text-center">
            <Link
              aria-label={copy.homeAria}
              className="grid h-9 w-9 place-items-center text-[#111111]"
              to="/"
            >
              <OnehandLogoMark className="h-8 w-8" />
            </Link>

            <h1
              className="mt-6 text-[24px] font-black leading-[1.12] tracking-normal text-[#050505]"
              id="login-title"
            >
              {copy.title}
            </h1>
            <p className="mt-1 text-[23px] font-bold leading-[1.18] tracking-normal text-[#8f8f8b]">
              {copy.subtitles[mode]}
            </p>
          </div>

          <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e9e9e7]" />
                <span className="text-[14px] font-medium text-[#8f8f8b]">
                  {copy.providerLead[mode]}
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
            {copy.switchLead[mode]}{" "}
            <Link
              className="text-[#4f4f4b] underline decoration-[#c9c9c5] underline-offset-4 hover:text-[#191919]"
              to={switchPath}
            >
              {copy.switchAction[mode]}
            </Link>
          </p>

          <p className="mx-auto mt-7 max-w-[300px] text-center text-[12px] font-medium leading-5 text-[#8f8f8b]">
            {copy.termsPrefix}
            <Link
              className="underline decoration-[#c9c9c5] underline-offset-3 hover:text-[#191919]"
              to="/terms"
            >
              {copy.terms}
            </Link>
            {copy.termsConnector}
            <Link
              className="underline decoration-[#c9c9c5] underline-offset-3 hover:text-[#191919]"
              to="/privacy"
            >
              {copy.privacy}
            </Link>
            {copy.termsSuffix}
          </p>
        </section>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <LoginLanguageSelect copy={copy} language={language} />
      </div>

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
