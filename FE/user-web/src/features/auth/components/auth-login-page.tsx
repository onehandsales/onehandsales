import { Loader2 } from "lucide-react";
import type {
  AuthProviderId,
  AuthProviderOption,
} from "@/features/auth/types/auth";

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
  kakao: "border-[#E8D100] bg-[#FEE500] text-[#191919] hover:bg-[#F5DC00]",
  google: "border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F8F9FA]",
};

const providerLabels: Record<AuthProviderId, string> = {
  kakao: "Kakao로 계속하기",
  google: "Google로 계속하기",
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
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      {/* Header */}
      <header className="flex h-14 items-center px-6">
        <a
          className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]"
          href="/"
        >
          <div className="grid h-6 w-6 place-items-center rounded-[6px] bg-[#4880EE]">
            <span className="text-[10px] font-extrabold text-white">한</span>
          </div>
          한손에 영업
        </a>
      </header>

      {/* Body */}
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[360px]">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">
              로그인
            </h1>
            <p className="mt-1.5 text-[14px] text-[#6B7280]">
              소셜 계정으로 간편하게 시작하세요
            </p>
          </div>

          {/* Providers */}
          {isLoginLoading ? (
            <div className="flex h-[140px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#4880EE]" />
            </div>
          ) : (
            <div className="grid gap-3">
              {isProvidersLoading ? (
                <div className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white text-sm text-[#6B7280]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  로딩 중...
                </div>
              ) : null}

              {!isProvidersLoading && enabledProviders.length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-[#E5E7EB] bg-white px-4 py-4 text-center text-sm text-[#6B7280]">
                  활성화된 로그인 수단이 없어요.
                </div>
              ) : null}

              {enabledProviders.map((provider) => (
                <button
                  className={[
                    "relative flex h-[52px] w-full items-center rounded-[10px] border px-4 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    providerStyles[provider.provider],
                  ].join(" ")}
                  disabled={isPending}
                  key={provider.provider}
                  onClick={() => onProviderLogin(provider.provider)}
                  type="button"
                >
                  <span
                    className={[
                      "grid h-[28px] w-[28px] shrink-0 place-items-center rounded-md",
                      providerLogoShellStyles[provider.provider],
                    ].join(" ")}
                  >
                    <img
                      alt=""
                      aria-hidden="true"
                      className="h-[20px] w-[20px]"
                      src={providerLogos[provider.provider]}
                    />
                  </span>
                  <span className="flex-1 text-center">
                    {providerLabels[provider.provider] ??
                      `${provider.label}로 계속하기`}
                  </span>
                  <span className="w-[28px] shrink-0 text-right">
                    {isPending && pendingProvider === provider.provider ? (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Errors */}
          {providersError ? (
            <p className="mt-4 rounded-[10px] border border-yellow-200 bg-yellow-50 px-3 py-2 text-center text-xs text-yellow-800">
              로그인 수단을 불러오지 못했어요. {providersError}
            </p>
          ) : null}

          {authError ? (
            <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
              {authError}
            </p>
          ) : null}

          {/* Divider */}
          <div className="mt-8 border-t border-[#E5E7EB]" />

          {/* Footer note */}
          <p className="mt-5 text-center text-[12px] leading-relaxed text-[#9CA3AF]">
            계속 진행하면{" "}
            <span className="underline underline-offset-2">이용약관</span> 및{" "}
            <span className="underline underline-offset-2">개인정보처리방침</span>
            에 동의한 것으로 간주됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
