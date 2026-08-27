import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ModalShell } from "@/components/ui/modal-shell";
import { authService } from "@/features/auth/auth-service";
import { useAuthSession } from "@/features/auth/auth-context";
import { authProviderModalCopy } from "@/features/auth/components/auth-provider-modal-copy";
import type {
  AuthProviderId,
  AuthProviderOption,
} from "@/features/auth/types/auth";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";
import { getApiErrorMessage } from "@/lib/api-client";

type AuthSocialLoginModalProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

const fallbackProviders: AuthProviderOption[] = [
  { provider: "google", label: "Google", enabled: true },
  { provider: "line", label: "LINE", enabled: true },
  { provider: "apple", label: "Apple", enabled: true },
];

const sharedProviderButtonStyle =
  "border-[#DADCE0] bg-white text-[#3C4043] hover:bg-[#F8FAFC]";

// 기능 : 모달 OAuth 버튼도 provider별 배경색 없이 Google 버튼 기준 스타일을 공유합니다.
const providerStyles: Record<AuthProviderId, string> = {
  google: sharedProviderButtonStyle,
  line: sharedProviderButtonStyle,
  apple: sharedProviderButtonStyle,
};

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

export function AuthSocialLoginModal({
  open,
  onOpenChange,
}: AuthSocialLoginModalProps) {
  const {
    clearError,
    error: authError,
    isPending,
    startProviderLogin,
  } = useAuthSession();
  const { language } = usePublicSiteLanguage();
  const copy = authProviderModalCopy[getPublicSiteCopyLanguage(language)];
  const [providers, setProviders] = useState<AuthProviderOption[]>([]);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [isProvidersLoading, setIsProvidersLoading] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<AuthProviderId | null>(
    null
  );
  const enabledProviders = useMemo(
    () => providers.filter((provider) => provider.enabled),
    [providers]
  );

  useEffect(() => {
    if (!open) {
      setPendingProvider(null);
      return;
    }

    clearError();

    if (providers.length > 0) {
      return;
    }

    let isMounted = true;
    setIsProvidersLoading(true);

    void authService
      .listProviders()
      .then((response) => {
        if (isMounted) {
          setProviders(response.providers);
          setProvidersError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setProviders(fallbackProviders);
          setProvidersError(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProvidersLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clearError, open, providers.length]);

  useEffect(() => {
    if (!isPending) {
      setPendingProvider(null);
    }
  }, [isPending]);

  const onProviderLogin = (provider: AuthProviderId) => {
    setPendingProvider(provider);
    void startProviderLogin(provider).catch(() => {
      setPendingProvider(null);
    });
  };

  return (
    <ModalShell
      bodyClassName="flex flex-1 flex-col px-8 pb-6 pt-7 max-[460px]:px-6"
      closeButtonClassName="right-3.5 top-3.5 h-[32px] w-[32px] rounded-full border-0 bg-[#F3F4F6] text-[#9CA3AF]"
      closeLabel={copy.closeLabel}
      open={open}
      panelClassName="min-h-[408px] w-[380px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] rounded-[16px] border-0 shadow-[0_20px_50px_rgba(15,23,42,0.18),0_2px_8px_rgba(15,23,42,0.08)]"
      placement="bottom"
      size="sm"
      onOpenChange={(nextOpen) => {
        if (!isPending || nextOpen) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <div className="grid justify-items-center gap-2.5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#4880EE]">
            <span className="text-[15px] font-normal text-white">
              {copy.brandGlyph}
            </span>
          </div>
          <h2 className="text-[20px] font-normal text-[#111827]">
            {copy.brandName}
          </h2>
        </div>
        <p className="text-[13px] text-[#6B7280]">{copy.tagline}</p>
      </div>

      <div className="my-4 h-px bg-[#F1F5F9]" />

      <p className="mt-1 text-center text-[13px] text-[#9CA3AF]">
        {copy.providerLead}
      </p>

      {/* 기능 : OAuth provider 버튼을 3열로 고정해 모바일 모달에서도 한 줄 선택을 유지합니다. */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {isProvidersLoading ? (
          <div className="col-span-3 flex h-[50px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB]">
            <Loader2 className="h-4 w-4 animate-spin text-[#4880EE]" />
            <span className="sr-only">{copy.providerLoading}</span>
          </div>
        ) : null}

        {!isProvidersLoading && enabledProviders.length === 0 ? (
          <div className="col-span-3 rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 text-center text-sm text-[#6B7280]">
            {copy.noProviders}
          </div>
        ) : null}

        {enabledProviders.map((provider) => (
          <button
            aria-label={copy.providerLabels[provider.provider] ?? provider.label}
            className={[
              "relative grid h-[72px] min-w-0 place-items-center gap-1 rounded-[10px] border px-1.5 py-2 text-[12px] font-normal disabled:cursor-not-allowed disabled:opacity-60",
              providerStyles[provider.provider],
            ].join(" ")}
            disabled={isPending}
            key={provider.provider}
            onClick={() => onProviderLogin(provider.provider)}
            type="button"
          >
            {isPending && pendingProvider === provider.provider ? (
              <Loader2 className="absolute right-1.5 top-1.5 h-3.5 w-3.5 animate-spin" />
            ) : null}
            <span className="grid h-9 w-9 shrink-0 place-items-center">
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
            <span className="min-w-0 max-w-full truncate text-center">
              {provider.label}
            </span>
          </button>
        ))}
      </div>

      {providersError ? (
        <p className="mt-4 rounded-[10px] border border-yellow-200 bg-yellow-50 px-3 py-2 text-center text-xs text-yellow-800">
          {copy.providersErrorPrefix} {providersError}
        </p>
      ) : null}

      {authError ? (
        <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
          {copy.providerFailure}
        </p>
      ) : null}
    </ModalShell>
  );
}
