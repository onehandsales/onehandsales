import { Loader2 } from "lucide-react";
import { ModalShell } from "@/components/ui/modal-shell";
import type {
  AuthProviderId,
  AuthProviderOption,
} from "@/features/auth/types/auth";

type AuthLoginModalProps = {
  readonly authError: string | null;
  readonly callbackMessage: string | null;
  readonly enabledProviders: readonly AuthProviderOption[];
  readonly isPending: boolean;
  readonly isProvidersLoading: boolean;
  readonly providersError: string | null;
  readonly onClose: () => void;
  readonly onMockLogin: () => void;
  readonly onProviderLogin: (provider: AuthProviderId) => void;
};

const providerStyles: Record<AuthProviderId, string> = {
  kakao: "border-[#FEE500] bg-[#FEE500] text-[#191919]",
  naver: "border-[#03C75A] bg-[#03C75A] text-white",
  google: "border-[#E5E7EB] bg-[#3B82F6] text-white",
};

const providerLabels: Record<AuthProviderId, string> = {
  kakao: "카카오로 계속하기",
  naver: "네이버로 계속하기",
  google: "Google로 계속하기",
};

const logoStyles: Record<AuthProviderId, string> = {
  kakao: "bg-[#3C1E1E] text-[#FEE500]",
  naver: "bg-white text-[#03C75A]",
  google: "border border-[#E5E7EB] bg-white text-[#4285F4]",
};

export function AuthLoginModal({
  authError,
  callbackMessage,
  enabledProviders,
  isPending,
  isProvidersLoading,
  providersError,
  onClose,
  onMockLogin,
  onProviderLogin,
}: AuthLoginModalProps) {
  return (
    <ModalShell
      bodyClassName="px-10 pb-9 pt-10 max-[460px]:px-6"
      closeButtonClassName="right-4 top-3.5 h-[34px] w-[34px] rounded-full border-0 bg-[#F3F4F6] text-[#9CA3AF]"
      closeLabel="로그인 모달 닫기"
      open
      panelClassName="max-h-[calc(100vh-2rem)] rounded-[16px] border-0 shadow-[0_24px_64px_rgba(0,0,0,0.19),0_4px_12px_rgba(0,0,0,0.08)]"
      placement="bottom"
      size="sm"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <div className="grid justify-items-center gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#4880EE]">
            <span className="text-base font-extrabold text-white">한</span>
          </div>
          <h2
            className="text-[22px] font-bold text-[#111827]"
            id="login-modal-title"
          >
            한손에 영업
          </h2>
        </div>
        <p className="text-sm text-[#6B7280]">영업을 더 스마트하게</p>
      </div>

      <div className="my-6 h-px bg-[#F1F5F9]" />

      <p className="text-center text-[13px] text-[#9CA3AF]">
            소셜 계정으로 간편하게 시작해요
      </p>

      <div className="mt-6 grid gap-3">
        {isProvidersLoading ? (
          <div className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" />
            provider 목록을 불러오고 있어요.
          </div>
        ) : null}

        {!isProvidersLoading && enabledProviders.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-sm text-[#6B7280]">
            활성화된 로그인 provider가 없어요.
          </div>
        ) : null}

        {enabledProviders.map((provider) => (
          <button
            className={[
              "flex h-[52px] w-full items-center rounded-[10px] border px-5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
              providerStyles[provider.provider],
            ].join(" ")}
            disabled={isPending}
            key={provider.provider}
            onClick={() => onProviderLogin(provider.provider)}
            type="button"
          >
            <span
              className={[
                "grid h-[26px] w-[26px] shrink-0 place-items-center rounded-md text-sm font-black",
                logoStyles[provider.provider],
              ].join(" ")}
            >
              {provider.provider === "kakao"
                ? "K"
                : provider.provider === "naver"
                  ? "N"
                  : "G"}
            </span>
            <span className="flex-1 text-center">
              {providerLabels[provider.provider] ?? `${provider.label}로 계속하기`}
            </span>
            <span className="w-[26px] shrink-0">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            </span>
          </button>
        ))}
      </div>

      {callbackMessage ? (
        <p className="mt-4 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs text-emerald-800">
          {callbackMessage}
        </p>
      ) : null}

      {providersError ? (
        <p className="mt-4 rounded-[10px] border border-yellow-200 bg-yellow-50 px-3 py-2 text-center text-xs text-yellow-800">
          provider 목록을 불러오지 못해 기본 버튼을 보여줘요. {providersError}
        </p>
      ) : null}

      {authError ? (
        <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
          {authError}
        </p>
      ) : null}

      <p className="mt-5 whitespace-pre-line text-center text-[11px] leading-[1.6] text-[#9CA3AF]">
        {"로그인하면 서비스 이용약관 및 개인정보처리방침에\n동의하게 됩니다."}
      </p>

      <button
        className="mx-auto mt-2 block text-[11px] font-semibold text-[#94A3B8] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={onMockLogin}
        type="button"
      >
        개발용 mock 세션으로 입장
      </button>
    </ModalShell>
  );
}
