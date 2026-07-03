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
  readonly isLoginLoading: boolean;
  readonly isPending: boolean;
  readonly isProvidersLoading: boolean;
  readonly pendingProvider: AuthProviderId | null;
  readonly providersError: string | null;
  readonly onClose: () => void;
  readonly onProviderLogin: (provider: AuthProviderId) => void;
};

const providerStyles: Record<AuthProviderId, string> = {
  kakao: "border-[#E8D100] bg-[#FEE500] text-[#191919]",
  google: "border-[#DADCE0] bg-white text-[#3C4043]",
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
const modalBodyClassName = "flex flex-1 flex-col px-8 pb-6 pt-7 max-[460px]:px-6";
const loadingModalBodyClassName = "flex flex-1 items-center justify-center p-0";
const modalCloseButtonClassName =
  "right-3.5 top-3.5 h-[32px] w-[32px] rounded-full border-0 bg-[#F3F4F6] text-[#9CA3AF]";
const modalPanelClassName =
  "h-[320px] w-[380px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] rounded-[16px] border-0 shadow-[0_20px_50px_rgba(15,23,42,0.18),0_2px_8px_rgba(15,23,42,0.08)]";

export function AuthLoginModal({
  authError,
  callbackMessage,
  enabledProviders,
  isLoginLoading,
  isPending,
  isProvidersLoading,
  pendingProvider,
  providersError,
  onClose,
  onProviderLogin,
}: AuthLoginModalProps) {
  if (isLoginLoading) {
    return (
      <ModalShell
        bodyClassName={loadingModalBodyClassName}
        closeButtonClassName={modalCloseButtonClassName}
        closeLabel="로그인 모달 닫기"
        open
        panelClassName={modalPanelClassName}
        placement="bottom"
        showCloseButton={false}
        size="sm"
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            onClose();
          }
        }}
      >
        <Loader2
          aria-label="로그인 중"
          className="h-7 w-7 animate-spin text-[#4880EE]"
          role="status"
        />
      </ModalShell>
    );
  }

  return (
    <ModalShell
      bodyClassName={modalBodyClassName}
      closeButtonClassName={modalCloseButtonClassName}
      closeLabel="로그인 모달 닫기"
      open
      panelClassName={modalPanelClassName}
      placement="bottom"
      size="sm"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <div className="grid justify-items-center gap-2.5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#4880EE]">
            <span className="text-[15px] font-extrabold text-white">한</span>
          </div>
          <h2
            className="text-[20px] font-bold text-[#111827]"
            id="login-modal-title"
          >
            한손에 영업
          </h2>
        </div>
        <p className="text-[13px] text-[#6B7280]">영업을 더 스마트하게</p>
      </div>

      <div className="my-4 h-px bg-[#F1F5F9]" />

      <p className="mt-1 text-center text-[13px] text-[#9CA3AF]">
        소셜 계정으로 간편하게 시작하세요
      </p>

      <div className="mt-3 grid gap-2.5">
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
              "flex h-[50px] w-full items-center rounded-[10px] border px-4 text-[15px] font-normal disabled:cursor-not-allowed disabled:opacity-60",
              providerStyles[provider.provider],
            ].join(" ")}
            disabled={isPending}
            key={provider.provider}
            onClick={() => onProviderLogin(provider.provider)}
            type="button"
          >
            <span
              className={[
                "grid h-[30px] w-[30px] shrink-0 place-items-center rounded-md",
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
            <span className="flex-1 text-center">
              {providerLabels[provider.provider] ?? `${provider.label}로 계속하기`}
            </span>
            <span className="w-[26px] shrink-0">
              {isPending && pendingProvider === provider.provider ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
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
    </ModalShell>
  );
}
