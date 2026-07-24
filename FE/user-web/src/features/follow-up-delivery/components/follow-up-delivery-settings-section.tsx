import {
  AlertCircle,
  ExternalLink,
  Mail,
  MessageSquareText,
  RotateCw,
  ShieldCheck,
  Smartphone,
  Unlink,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useDisconnectFollowUpEmailConnectionMutation,
  useRequestFollowUpSmsSenderNumberVerificationMutation,
  useRevokeFollowUpSmsSenderNumberMutation,
  useStartFollowUpEmailConnectionMutation,
  useVerifyFollowUpSmsSenderNumberMutation,
} from "@/features/follow-up-delivery/hooks/use-follow-up-delivery-mutations";
import { useFollowUpDeliverySettings } from "@/features/follow-up-delivery/hooks/use-follow-up-delivery-queries";
import type {
  FollowUpEmailConnection,
  FollowUpEmailProvider,
  FollowUpSmsSenderNumber,
} from "@/features/follow-up-delivery/types/follow-up-delivery";
import { env } from "@/lib/env";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

type FollowUpDeliverySettingsSectionProps = {
  readonly onNotice: (message: string) => void;
};

const emailProviders: readonly {
  readonly provider: FollowUpEmailProvider;
  readonly label: string;
}[] = [
  { provider: "GOOGLE", label: "Gmail" },
  { provider: "MICROSOFT", label: "Microsoft 365" },
];

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function FollowUpDeliverySettingsSection({
  onNotice,
}: FollowUpDeliverySettingsSectionProps) {
  const settingsQuery = useFollowUpDeliverySettings();

  return (
    <section className="grid gap-3">
      <SettingsHeader />
      <div className="grid gap-5 rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
        {settingsQuery.isLoading ? (
          <SettingsSkeleton rows={5} />
        ) : settingsQuery.isError ? (
          <InlineError
            error={settingsQuery.error}
            onRetry={() => void settingsQuery.refetch()}
          />
        ) : (
          <>
            <EmailConnectionSettings
              connections={settingsQuery.data?.emailConnections ?? []}
              onChanged={() => void settingsQuery.refetch()}
              onNotice={onNotice}
            />
            <SmsSenderSettings
              onChanged={() => void settingsQuery.refetch()}
              onNotice={onNotice}
              senderNumbers={settingsQuery.data?.smsSenderNumbers ?? []}
            />
          </>
        )}
      </div>
    </section>
  );
}

function SettingsHeader() {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EAF2FF] text-[#1D4ED8]">
        <MessageSquareText className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-[#111827]">
          후속 연락
        </h2>
        <p className="mt-0.5 text-[12px] text-[#64748B]">
          AI 리포트에서 이메일과 문자 후속 연락을 보낼 발신 수단을 관리해요.
        </p>
      </div>
    </div>
  );
}

function EmailConnectionSettings({
  connections,
  onChanged,
  onNotice,
}: {
  readonly connections: readonly FollowUpEmailConnection[];
  readonly onChanged: () => void;
  readonly onNotice: (message: string) => void;
}) {
  const startConnectMutation = useStartFollowUpEmailConnectionMutation();
  const disconnectMutation = useDisconnectFollowUpEmailConnectionMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] =
    useState<FollowUpEmailConnection | null>(null);
  const connectionsByProvider = useMemo(
    () =>
      new Map(
        emailProviders.map(({ provider }) => [
          provider,
          getLatestConnection(connections, provider),
        ])
      ),
    [connections]
  );

  const connect = async (provider: FollowUpEmailProvider) => {
    setActionError(null);

    try {
      const response = await startConnectMutation.mutateAsync({
        provider,
        redirectUri: buildEmailRedirectUri(provider),
      });
      window.location.assign(response.authorizationUrl);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const disconnect = async () => {
    if (!disconnectTarget) {
      return;
    }

    setActionError(null);

    try {
      await disconnectMutation.mutateAsync({
        connectionId: disconnectTarget.id,
      });
      setDisconnectTarget(null);
      onChanged();
      onNotice(`${toProviderLabel(disconnectTarget.provider)} 연결을 해제했어요.`);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <section className="grid gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Mail className="h-4 w-4 shrink-0 text-[#4880EE]" />
        <h3 className="text-sm font-semibold text-[#111827]">이메일 발신</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {emailProviders.map(({ provider, label }) => {
          const connection = connectionsByProvider.get(provider) ?? null;
          const isConnected = connection?.status === "CONNECTED";
          const reconnectRequired =
            connection?.status === "RECONNECT_REQUIRED";

          return (
            <article
              className="grid min-w-0 gap-3 rounded-md border border-[#E2E5EC] bg-white px-3 py-3"
              key={provider}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#111827]">
                      {label}
                    </p>
                    <StatusBadge tone={getEmailStatusTone(connection)}>
                      {toEmailStatusLabel(connection)}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 truncate text-[12px] text-[#64748B]">
                    {connection?.providerAccountEmail ?? "연결된 계정이 없어요."}
                  </p>
                </div>
              </div>
              <dl className="grid gap-1 text-[12px] text-[#64748B]">
                <MetaRow
                  label="연결"
                  value={formatDateTime(connection?.connectedAt, {
                    includeYear: true,
                  })}
                />
                <MetaRow
                  label="재연결 필요"
                  value={formatDateTime(connection?.reconnectRequiredAt, {
                    fallback: "-",
                    includeYear: true,
                  })}
                />
              </dl>
              <div className="flex flex-wrap justify-end gap-2">
                {isConnected ? (
                  <Button
                    onClick={() => setDisconnectTarget(connection)}
                    size="sm"
                    type="button"
                    variant="danger"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    해제
                  </Button>
                ) : null}
                <Button
                  disabled={startConnectMutation.isPending}
                  isPending={
                    startConnectMutation.isPending && !disconnectMutation.isPending
                  }
                  onClick={() => void connect(provider)}
                  size="sm"
                  type="button"
                  variant={isConnected ? "secondary" : "primary"}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {isConnected ? "다시 연결" : reconnectRequired ? "재연결" : "연결"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      {actionError ? <InlineAlert message={actionError} /> : null}
      <ConfirmDialog
        cancelLabel="닫기"
        confirmLabel="연결 해제"
        errorMessage={actionError}
        isPending={disconnectMutation.isPending}
        open={disconnectTarget !== null}
        title="이메일 연결을 해제할까요?"
        onCancel={() => {
          if (!disconnectMutation.isPending) {
            setActionError(null);
            setDisconnectTarget(null);
          }
        }}
        onConfirm={() => void disconnect()}
      />
    </section>
  );
}

function SmsSenderSettings({
  senderNumbers,
  onChanged,
  onNotice,
}: {
  readonly senderNumbers: readonly FollowUpSmsSenderNumber[];
  readonly onChanged: () => void;
  readonly onNotice: (message: string) => void;
}) {
  const requestMutation =
    useRequestFollowUpSmsSenderNumberVerificationMutation();
  const verifyMutation = useVerifyFollowUpSmsSenderNumberMutation();
  const revokeMutation = useRevokeFollowUpSmsSenderNumberMutation();
  const [phoneE164, setPhoneE164] = useState("");
  const [verificationCodes, setVerificationCodes] = useState<
    Record<string, string>
  >({});
  const [actionError, setActionError] = useState<string | null>(null);

  const requestVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPhone = phoneE164.trim();

    if (!E164_PATTERN.test(normalizedPhone)) {
      setActionError("+821012345678 형식으로 입력해 주세요.");
      return;
    }

    setActionError(null);

    try {
      await requestMutation.mutateAsync({ phoneE164: normalizedPhone });
      setPhoneE164("");
      onChanged();
      onNotice("문자 발신번호 인증 코드를 보냈어요.");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const verify = async (senderNumberId: string) => {
    const code = verificationCodes[senderNumberId]?.trim() ?? "";

    if (!/^\d{4,8}$/.test(code)) {
      setActionError("인증 코드는 숫자 4~8자리로 입력해 주세요.");
      return;
    }

    setActionError(null);

    try {
      await verifyMutation.mutateAsync({ senderNumberId, code });
      setVerificationCodes((current) => ({
        ...current,
        [senderNumberId]: "",
      }));
      onChanged();
      onNotice("문자 발신번호를 인증했어요.");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const revoke = async (senderNumberId: string) => {
    setActionError(null);

    try {
      await revokeMutation.mutateAsync({ senderNumberId });
      onChanged();
      onNotice("문자 발신번호를 회수했어요.");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <section className="grid gap-3 border-t border-[#E2E5EC] pt-4">
      <div className="flex min-w-0 items-center gap-2">
        <Smartphone className="h-4 w-4 shrink-0 text-[#4880EE]" />
        <h3 className="text-sm font-semibold text-[#111827]">문자 발신번호</h3>
      </div>
      <form
        className="grid gap-2 rounded-md border border-[#E2E5EC] bg-[#F8FAFC] px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto]"
        onSubmit={(event) => void requestVerification(event)}
      >
        <label className="grid min-w-0 gap-1.5">
          <span className="text-[12px] font-medium text-[#64748B]">
            E.164 번호
          </span>
          <input
            className="h-9 min-w-0 rounded-md border border-[#D7DCE5] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
            onChange={(event) => setPhoneE164(event.target.value)}
            placeholder="+821012345678"
            value={phoneE164}
          />
        </label>
        <div className="flex items-end">
          <Button
            disabled={requestMutation.isPending}
            isPending={requestMutation.isPending}
            size="sm"
            type="submit"
            variant="primary"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            인증 요청
          </Button>
        </div>
      </form>

      {senderNumbers.length === 0 ? (
        <p className="rounded-md border border-dashed border-[#CBD5E1] bg-white px-3 py-4 text-[13px] text-[#64748B]">
          등록된 문자 발신번호가 없어요.
        </p>
      ) : (
        <div className="grid gap-2">
          {senderNumbers.map((senderNumber) => (
            <SmsSenderNumberRow
              code={verificationCodes[senderNumber.id] ?? ""}
              key={senderNumber.id}
              onCodeChange={(code) =>
                setVerificationCodes((current) => ({
                  ...current,
                  [senderNumber.id]: code,
                }))
              }
              onRevoke={() => void revoke(senderNumber.id)}
              onVerify={() => void verify(senderNumber.id)}
              revokePending={revokeMutation.isPending}
              senderNumber={senderNumber}
              verifyPending={verifyMutation.isPending}
            />
          ))}
        </div>
      )}

      {actionError ? <InlineAlert message={actionError} /> : null}
    </section>
  );
}

function SmsSenderNumberRow({
  senderNumber,
  code,
  verifyPending,
  revokePending,
  onCodeChange,
  onVerify,
  onRevoke,
}: {
  readonly senderNumber: FollowUpSmsSenderNumber;
  readonly code: string;
  readonly verifyPending: boolean;
  readonly revokePending: boolean;
  readonly onCodeChange: (code: string) => void;
  readonly onVerify: () => void;
  readonly onRevoke: () => void;
}) {
  const pending = senderNumber.status === "PENDING_VERIFICATION";
  const revoked = senderNumber.status === "REVOKED";

  return (
    <article className="grid gap-3 rounded-md border border-[#E2E5EC] bg-white px-3 py-3">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#111827]">
              {senderNumber.phoneE164Masked}
            </p>
            <StatusBadge tone={getSmsStatusTone(senderNumber)}>
              {toSmsStatusLabel(senderNumber)}
            </StatusBadge>
          </div>
          <p className="mt-1 text-[12px] text-[#64748B]">
            인증 만료 {formatDateTime(senderNumber.verificationExpiresAt, {
              fallback: "-",
              includeYear: true,
            })}
          </p>
        </div>
        {!revoked ? (
          <Button
            disabled={revokePending}
            onClick={onRevoke}
            size="sm"
            type="button"
            variant="danger"
          >
            회수
          </Button>
        ) : null}
      </div>
      {pending ? (
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            className="h-9 min-w-0 rounded-md border border-[#D7DCE5] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
            inputMode="numeric"
            maxLength={8}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder="인증 코드"
            value={code}
          />
          <Button
            disabled={verifyPending}
            isPending={verifyPending}
            onClick={onVerify}
            size="sm"
            type="button"
            variant="primary"
          >
            확인
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  readonly children: string;
  readonly tone: "blue" | "green" | "red" | "yellow";
}) {
  const className = {
    blue: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    green: "border-[#BBF7D0] bg-[#F0FDF4] text-[#047857]",
    red: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
    yellow: "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
  }[tone];

  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function MetaRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-3">
      <dt className="shrink-0">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-[#374151]">
        {value}
      </dd>
    </div>
  );
}

function InlineError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid justify-items-start gap-3 rounded-md border border-destructive/30 bg-red-50 px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      </div>
      <Button onClick={onRetry} size="sm" type="button">
        <RotateCw className="h-3.5 w-3.5" />
        다시 시도
      </Button>
    </div>
  );
}

function InlineAlert({ message }: { readonly message: string }) {
  return (
    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

function SettingsSkeleton({ rows }: { readonly rows: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="h-12 animate-pulse rounded-md bg-muted" key={index} />
      ))}
    </div>
  );
}

function getLatestConnection(
  connections: readonly FollowUpEmailConnection[],
  provider: FollowUpEmailProvider
) {
  return (
    connections.find(
      (connection) =>
        connection.provider === provider && connection.status === "CONNECTED"
    ) ??
    connections.find(
      (connection) =>
        connection.provider === provider &&
        connection.status === "RECONNECT_REQUIRED"
    ) ??
    connections.find((connection) => connection.provider === provider) ??
    null
  );
}

function getEmailStatusTone(connection: FollowUpEmailConnection | null) {
  if (connection?.status === "CONNECTED") {
    return "green";
  }

  if (connection?.status === "RECONNECT_REQUIRED") {
    return "yellow";
  }

  return connection ? "red" : "blue";
}

function toEmailStatusLabel(connection: FollowUpEmailConnection | null) {
  if (connection?.status === "CONNECTED") {
    return "연결됨";
  }

  if (connection?.status === "RECONNECT_REQUIRED") {
    return "재연결 필요";
  }

  if (connection?.status === "DISCONNECTED") {
    return "해제됨";
  }

  return "미연결";
}

function getSmsStatusTone(senderNumber: FollowUpSmsSenderNumber) {
  if (senderNumber.status === "VERIFIED") {
    return "green";
  }

  if (senderNumber.status === "PENDING_VERIFICATION") {
    return "yellow";
  }

  return "red";
}

function toSmsStatusLabel(senderNumber: FollowUpSmsSenderNumber) {
  switch (senderNumber.status) {
    case "PENDING_VERIFICATION":
      return "인증 대기";
    case "VERIFIED":
      return "인증됨";
    case "REVOKED":
      return "회수됨";
  }
}

function toProviderLabel(provider: FollowUpEmailProvider) {
  return provider === "GOOGLE" ? "Gmail" : "Microsoft 365";
}

function buildEmailRedirectUri(provider: FollowUpEmailProvider) {
  const baseUrl = env.apiUrl.endsWith("/")
    ? env.apiUrl.slice(0, -1)
    : env.apiUrl;

  return `${baseUrl}/api/follow-up-delivery/email-connections/${provider.toLowerCase()}/callback`;
}
