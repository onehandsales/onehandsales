import { ChevronDown, Globe2, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import type {
  AuthProviderId,
  AuthProviderOption,
} from "@/features/auth/types/auth";
import {
  getPublicSiteCopyLanguage,
  getPublicSiteLanguageOptionLabel,
  publicSiteLanguageOptions,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";
import {
  usePublicSiteLocaleSwitcher,
  usePublicSitePath,
} from "@/features/public-site/i18n/public-site-locale-hooks";

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

const sharedProviderButtonStyle =
  "border-[#dededa] bg-white text-[#191919] hover:bg-[#F2F2EF]";

// 기능 : 모든 OAuth 버튼을 Google 버튼과 같은 흰 배경/회색 테두리 스타일로 통일합니다.
const providerStyles: Record<AuthProviderId, string> = {
  google: sharedProviderButtonStyle,
  line: sharedProviderButtonStyle,
  apple: sharedProviderButtonStyle,
};

const providerOrder: readonly AuthProviderId[] = ["google", "line", "apple"];

const loginCopy: Record<
  PublicSiteCopyLanguage,
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
    readonly providerFailure: string;
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
      login: "OneHand 계정에 로그인",
      signup: "OneHand 계정 만들기",
    },
    providerLead: {
      login: "다음으로 계속하기",
      signup: "또는 다음으로 계속하기",
    },
    providers: {
      google: "Google",
      line: "LINE",
      apple: "Apple",
    },
    loading: "로그인 수단을 불러오고 있어요.",
    callbackLoading: "로그인하고 있어요.",
    noProviders: "사용할 수 있는 로그인이 없어요.",
    providersErrorPrefix: "로그인 수단을 불러오지 못했어요.",
    providerFailure: "로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.",
    switchLead: {
      login: "신규 사용자이신가요?",
      signup: "기존 사용자이신가요?",
    },
    switchAction: {
      login: "가입하기",
      signup: "로그인하기",
    },
    termsPrefix: "계속 진행시 ",
    terms: "이용약관",
    termsConnector: "과 ",
    privacy: "개인정보 처리방침",
    termsSuffix: "에 동의한 것으로 간주해요.",
    languagePrefix: "지역:",
  },  "en-US": {
    homeAria: "Go home",
    title: "Your AI workspace",
    subtitles: {
      login: "Log in to OneHand",
      signup: "Create your OneHand account",
    },
    providerLead: {
      login: "Continue with",
      signup: "Continue with",
    },
    providers: {
      google: "Google",
      line: "LINE",
      apple: "Apple",
    },
    loading: "Loading sign-in options.",
    callbackLoading: "Signing you in.",
    noProviders: "No sign-in methods are available.",
    providersErrorPrefix: "Could not load sign-in methods.",
    providerFailure: "We could not complete sign-in. Please try again shortly.",
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
    languagePrefix: "Region:",
  },};

const providerLogos: Record<AuthProviderId, string> = {
  google: "/auth/google-logo.png",
  line: "/auth/line-logo.png",
  apple: "/auth/apple-logo.png",
};

const providerLogoStyles: Record<AuthProviderId, string> = {
  google: "h-7 w-7",
  line: "h-[30px] w-[30px]",
  apple: "h-[30px] w-[30px]",
};

// 기능 : 로그인/회원가입 provider 선택 화면을 렌더링합니다.
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
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  // 2. 처리 흐름에 필요한 publicSitePath 값을 준비한다.
  const publicSitePath = usePublicSitePath();
  // 3. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy = loginCopy[getPublicSiteCopyLanguage(language)];
  // 4. 이후 단계에서 사용할 switchPath 값을 준비한다.
  const switchPath = publicSitePath(mode === "login" ? "/signup" : "/login");
  // 5. 이후 단계에서 사용할 visibleProviders 값을 준비한다.
  const visibleProviders = providerOrder
    .map((providerId) =>
      enabledProviders.find((provider) => provider.provider === providerId)
    )
    .filter((provider): provider is AuthProviderOption => Boolean(provider));

  // 6. 로딩 중이면 진행 상태 화면을 반환한다.
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

  // 7. provider 선택 로그인/회원가입 화면을 반환한다.
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-white text-[#191919]">
      <main className="flex flex-1 items-center justify-center px-5 py-24">
        <section className="w-full max-w-[360px]" aria-labelledby="login-title">
          <div className="grid justify-items-center text-center">
            <Link
              aria-label={copy.homeAria}
              className="grid h-9 w-9 place-items-center text-[#111111]"
              to={publicSitePath("/")}
            >
              <OneHandLogoMark className="h-9 w-9" />
            </Link>

            <h1
              className="mt-6 text-[24px] font-normal leading-[1.12] tracking-normal text-[#050505]"
              id="login-title"
            >
              {copy.title}
            </h1>
            <p className="mt-1 text-[23px] font-normal leading-[1.18] tracking-normal text-[#8f8f8b]">
              {copy.subtitles[mode]}
            </p>
          </div>

          <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e9e9e7]" />
                <span className="text-[14px] font-normal text-[#8f8f8b]">
                  {copy.providerLead[mode]}
                </span>
                <div className="h-px flex-1 bg-[#e9e9e7]" />
              </div>

              {/* 기능 : OAuth provider 버튼을 3열로 고정해 로그인/회원가입 선택지를 한 줄에 보여줍니다. */}
              <div className="mt-8 grid grid-cols-3 gap-2.5">
                {isProvidersLoading ? (
                  <div className="col-span-3 flex h-[74px] items-center justify-center gap-2 rounded-[7px] border border-[#dededa] bg-white text-[13px] font-normal text-[#777770]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2383e2]" />
                    {copy.loading}
                  </div>
                ) : null}

                {!isProvidersLoading && visibleProviders.length === 0 ? (
                  <div className="col-span-3 rounded-[7px] border border-dashed border-[#dededa] bg-white px-4 py-5 text-center text-[13px] font-normal text-[#777770]">
                    {copy.noProviders}
                  </div>
                ) : null}

                {visibleProviders.map((provider) => (
                  <button
                    className={[
                      "relative grid h-[74px] min-w-0 place-items-center gap-1 rounded-[7px] border px-2 py-2 text-[13px] font-normal shadow-[0_1px_1px_rgba(15,15,15,0.02)] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
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
                    <span className="grid h-9 w-9 place-items-center">
                      <img
                        alt=""
                        aria-hidden="true"
                        className={[
                          "block object-contain",
                          providerLogoStyles[provider.provider],
                        ].join(" ")}
                        src={providerLogos[provider.provider]}
                      />
                    </span>
                    <span className="min-w-0 max-w-full truncate">
                      {copy.providers[provider.provider]}
                    </span>
                  </button>
                ))}
              </div>
          </div>

          {providersError && visibleProviders.length === 0 ? (
            <p className="mt-5 rounded-[7px] border border-[#f0d9a5] bg-[#fff8e5] px-3 py-2 text-center text-[12px] font-normal leading-5 text-[#8a5d00]">
              {copy.providersErrorPrefix} {providersError}
            </p>
          ) : null}

          {authError ? (
            <p className="mt-5 rounded-[7px] border border-[#f1b6b6] bg-[#fff4f4] px-3 py-2 text-center text-[12px] font-normal leading-5 text-[#a12b2b]">
              {copy.providerFailure}
            </p>
          ) : null}

          <p className="mt-8 text-center text-[15px] font-normal text-[#777770]">
            {copy.switchLead[mode]}{" "}
            <Link
              className="text-[#4f4f4b] underline decoration-[#c9c9c5] underline-offset-4 hover:text-[#191919]"
              to={switchPath}
            >
              {copy.switchAction[mode]}
            </Link>
          </p>

          <p className="mx-auto mt-7 max-w-[300px] text-center text-[12px] font-normal leading-5 text-[#8f8f8b]">
            {copy.termsPrefix}
            <Link
              className="underline decoration-[#c9c9c5] underline-offset-3 hover:text-[#191919]"
              to={publicSitePath("/terms")}
            >
              {copy.terms}
            </Link>
            {copy.termsConnector}
            <Link
              className="underline decoration-[#c9c9c5] underline-offset-3 hover:text-[#191919]"
              to={publicSitePath("/privacy")}
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

// 기능 : 로그인 화면 언어 선택 메뉴를 렌더링합니다.
function LoginLanguageSelect({
  copy,
  language,
}: {
  readonly copy: (typeof loginCopy)[PublicSiteCopyLanguage];
  readonly language: PublicSiteLanguage;
}) {
  // 1. 처리 흐름에 필요한 switchLocale 값을 준비한다.
  const switchLocale = usePublicSiteLocaleSwitcher();
  // 2. 처리 흐름에 필요한 detailsRef 값을 준비한다.
  const detailsRef = useRef<HTMLDetailsElement>(null);
  // 3. 이후 단계에서 사용할 selectedOption 값을 준비한다.
  const selectedOption = publicSiteLanguageOptions.find(
    (option) => option.value === language
  );
  // 4. 이후 단계에서 사용할 selectedLabel 값을 준비한다.
  const selectedLabel = getPublicSiteLanguageOptionLabel(
    selectedOption,
    language
  );

  // 5. 렌더링 이후 필요한 언어 메뉴 이벤트를 등록한다.
  useEffect(() => {
    // 기능 : 언어 선택 메뉴를 닫습니다.
    // 1. 언어 선택 메뉴를 닫는 내부 함수를 준비한다.
    const closeLanguageMenu = () => {
      detailsRef.current?.removeAttribute("open");
    };

    // 기능 : 언어 선택 메뉴 외부 클릭을 처리합니다.
    const onPointerDown = (event: PointerEvent) => {
      // 2. 이후 단계에서 사용할 target 값을 준비한다.
      const target = event.target;

      if (
        target instanceof Node &&
        !detailsRef.current?.contains(target)
      ) {
        closeLanguageMenu();
      }
    };

    // 기능 : Escape 키로 언어 선택 메뉴를 닫습니다.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // 3. Escape 입력 시 언어 선택 메뉴를 닫는다.
        closeLanguageMenu();
      }
    };

    // 4. 브라우저 이벤트 listener를 등록한다.
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    // 5. 브라우저 이벤트 listener를 정리한다.
    return () => {
      // 1. 외부 클릭 listener를 정리한다.
      document.removeEventListener("pointerdown", onPointerDown);
      // 2. 키보드 listener를 정리한다.
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // 6. 언어 선택 드롭다운을 반환한다.
  return (
    <details className="group relative" ref={detailsRef}>
      <summary
        className="inline-flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-[6px] px-2 text-[14px] font-normal text-[#777770] transition-colors hover:bg-[#f2f2ef] hover:text-[#111111] [&::-webkit-details-marker]:hidden"
        aria-label={copy.languagePrefix}
      >
        <Globe2 className="h-4 w-4" />
        <span>
          {copy.languagePrefix} {selectedLabel}
        </span>
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute bottom-10 left-1/2 z-50 grid w-44 -translate-x-1/2 gap-1 overflow-hidden rounded-[8px] border border-[#dededa] bg-white p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
        {publicSiteLanguageOptions.map((option) => (
          <button
            className={[
              "block min-h-8 w-full rounded-[6px] px-3 py-1.5 text-left text-[12px] font-normal transition-colors hover:bg-[#f2f2ef] hover:text-[#111111]",
              option.value === language
                ? "bg-[#0000000D] text-[#111111]"
                : "text-[#333330]",
            ].join(" ")}
            data-login-language-option={option.value}
            key={option.value}
            onClick={(event) => {
              switchLocale(option.value);
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            type="button"
          >
            {getPublicSiteLanguageOptionLabel(option, language)}
          </button>
        ))}
      </div>
    </details>
  );
}
