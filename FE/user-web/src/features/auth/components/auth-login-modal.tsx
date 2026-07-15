import { Loader2 } from "lucide-react";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  authProviderModalCopy,
  getAuthProviderContinueLabel,
} from "@/features/auth/components/auth-provider-modal-copy";
import type {
  AuthProviderId,
  AuthProviderOption,
} from "@/features/auth/types/auth";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

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
  google: "border-[#DADCE0] bg-white text-[#3C4043]",
};

const providerLogos: Record<AuthProviderId, string> = {
  google: "/auth/google-logo.svg",
};
const providerLogoShellStyles: Record<AuthProviderId, string> = {
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
  const { language } = usePublicSiteLanguage();
  const copy = authProviderModalCopy[getPublicSiteCopyLanguage(language)];

  if (isLoginLoading) {
    return (
      <ModalShell
        bodyClassName={loadingModalBodyClassName}
        closeButtonClassName={modalCloseButtonClassName}
        closeLabel={copy.closeLabel}
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
          aria-label={copy.loadingLabel}
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
      closeLabel={copy.closeLabel}
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
            <span className="text-[15px] font-extrabold text-white">
              {copy.brandGlyph}
            </span>
          </div>
          <h2
            className="text-[20px] font-bold text-[#111827]"
            id="login-modal-title"
          >
            {copy.brandName}
          </h2>
        </div>
        <p className="text-[13px] text-[#6B7280]">{copy.tagline}</p>
      </div>

      <div className="my-4 h-px bg-[#F1F5F9]" />

      <p className="mt-1 text-center text-[13px] text-[#9CA3AF]">
        {copy.providerLead}
      </p>

      <div className="mt-3 grid gap-2.5">
        {isProvidersLoading ? (
          <div className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#6B7280]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {copy.providerLoading}
          </div>
        ) : null}

        {!isProvidersLoading && enabledProviders.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-sm text-[#6B7280]">
            {copy.noProviders}
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
              {getAuthProviderContinueLabel({
                language,
                provider: provider.provider,
                providerLabel: provider.label,
              })}
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
          {copy.providersErrorPrefix} {providersError}
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
