import {
  Download,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useCancelMyAccountDeletionRequestMutation,
  useCreateMyAccountDeletionRequestMutation,
  useCreateMyDataExportRequestMutation,
} from "@/features/account-request/hooks/use-account-request-mutations";
import { useMyDataExportRequest } from "@/features/account-request/hooks/use-account-request-queries";
import type {
  AccountDeletionRequestResponse,
  AccountDeletionRequestStatus,
  UserDataExportRequestResponse,
  UserDataExportRequestStatus,
} from "@/features/account-request/types/account-request";
import { getApiErrorMessage } from "@/lib/api-client";

const confirmText = "DELETE MY ACCOUNT";
const deletionReasons = [
  { value: "", label: "선택 안 함" },
  { value: "NO_LONGER_NEEDED", label: "더 이상 사용하지 않아요" },
  { value: "DUPLICATE_ACCOUNT", label: "다른 계정을 사용해요" },
  { value: "PRIVACY_CONCERN", label: "개인정보가 걱정돼요" },
  { value: "OTHER", label: "기타" },
] as const;

type AccountDataRequestsPresentation = "page" | "modal";

type AccountDataRequestsSettingsSectionProps = {
  readonly onNotice: (message: string) => void;
  readonly presentation?: AccountDataRequestsPresentation;
};

// 기능 : 설정 화면과 계정 모달에서 사용자 데이터 export와 계정 삭제 요청 UI를 렌더링합니다.
export function AccountDataRequestsSettingsSection({
  onNotice,
  presentation = "page",
}: AccountDataRequestsSettingsSectionProps) {
  const [dataExportRequestId, setDataExportRequestId] = useState<string | null>(
    null,
  );
  const [dataExportSnapshot, setDataExportSnapshot] =
    useState<UserDataExportRequestResponse | null>(null);
  const [deletionRequest, setDeletionRequest] =
    useState<AccountDeletionRequestResponse | null>(null);
  const dataExportQuery = useMyDataExportRequest(dataExportRequestId);
  const activeDataExport = dataExportQuery.data ?? dataExportSnapshot;
  const contentClassName =
    presentation === "page"
      ? "grid gap-4 rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm"
      : "grid min-w-0 gap-5";

  // 기능 : 생성된 데이터 export 요청을 화면 상태와 안내 notice로 연결합니다.
  function handleDataExportCreated(request: UserDataExportRequestResponse) {
    setDataExportSnapshot(request);
    setDataExportRequestId(request.id);
    onNotice("데이터 export 요청을 접수했어요.");
  }

  // 기능 : 데이터 export 요청 상태 새로고침 결과를 화면 상태와 안내 notice로 연결합니다.
  async function refreshDataExportRequest() {
    if (!dataExportRequestId) {
      return;
    }

    const result = await dataExportQuery.refetch();

    if (result.error) {
      throw result.error;
    }

    if (result.data) {
      setDataExportSnapshot(result.data);
    }

    onNotice("데이터 export 요청 상태를 새로고침했어요.");
  }

  // 기능 : 계정 삭제 요청 취소 결과를 화면 상태와 안내 notice로 연결합니다.
  function handleDeletionCancelled(response: {
    readonly status: AccountDeletionRequestStatus;
  }) {
    setDeletionRequest((current) =>
      current
        ? {
            ...current,
            status: response.status,
          }
        : current,
    );
    onNotice("계정 삭제 요청을 취소했어요.");
  }

  // 기능 : 생성된 계정 삭제 요청을 화면 상태와 안내 notice로 연결합니다.
  function handleDeletionCreated(request: AccountDeletionRequestResponse) {
    setDeletionRequest(request);
    onNotice("계정 삭제 요청을 접수했어요.");
  }

  const content = (
    <div className={contentClassName}>
      <DataExportPanel
        isRefreshing={dataExportQuery.isFetching}
        onCreated={handleDataExportCreated}
        onRefresh={refreshDataExportRequest}
        presentation={presentation}
        request={activeDataExport}
      />
      <div
        className={
          presentation === "page" ? "h-px bg-[#E2E5EC]" : "h-px bg-[#F0F2F6]"
        }
      />
      <AccountDeletionPanel
        onCancelled={handleDeletionCancelled}
        onCreated={handleDeletionCreated}
        presentation={presentation}
        request={deletionRequest}
      />
    </div>
  );

  if (presentation === "modal") {
    return (
      <section className="grid min-w-0 gap-4">
        <p className="text-[13px] leading-6 text-[#64748B]">
          내 데이터 export와 계정 삭제 요청을 관리해요. 요청 상태와 위험 액션은
          이 모달 안에서 확인할 수 있어요.
        </p>
        {content}
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      <SettingsCardHeader
        description="내 데이터 export와 계정 삭제 요청을 관리해요"
        icon={ShieldAlert}
        title="계정 데이터 요청"
      />
      {content}
    </section>
  );
}

// 기능 : 데이터 export 요청 생성과 상태 새로고침 UI를 렌더링합니다.
function DataExportPanel({
  request,
  isRefreshing,
  onCreated,
  onRefresh,
  presentation,
}: {
  readonly request: UserDataExportRequestResponse | null;
  readonly isRefreshing: boolean;
  readonly onCreated: (request: UserDataExportRequestResponse) => void;
  readonly onRefresh: () => Promise<void>;
  readonly presentation: AccountDataRequestsPresentation;
}) {
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateMyDataExportRequestMutation();
  const neutralPrimaryButtonClassName =
    presentation === "modal"
      ? "border-[#111827] bg-[#111827] text-white hover:bg-[#374151]"
      : undefined;

  // 기능 : 데이터 export 생성 버튼 클릭을 처리합니다.
  async function handleCreate() {
    setError(null);

    try {
      const response = await createMutation.mutateAsync({
        includeSensitive: false,
        format: "ZIP_JSON_XLSX",
      });
      onCreated(response);
    } catch (nextError) {
      setError(getApiErrorMessage(nextError));
    }
  }

  // 기능 : 데이터 export 상태 새로고침 버튼 클릭을 처리합니다.
  async function handleRefresh() {
    setError(null);

    try {
      await onRefresh();
    } catch (nextError) {
      setError(getApiErrorMessage(nextError));
    }
  }

  return (
    <section className="grid min-w-0 gap-3">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <PanelTitle
          description="계정에 연결된 일반 데이터를 ZIP_JSON_XLSX 형식으로 준비해요"
          icon={Download}
          title="내 데이터 export"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            className={neutralPrimaryButtonClassName}
            disabled={createMutation.isPending}
            isPending={createMutation.isPending}
            onClick={handleCreate}
            size="sm"
            type="button"
            variant={presentation === "modal" ? "secondary" : "primary"}
          >
            <Download className="h-3.5 w-3.5" />
            요청
          </Button>
          <Button
            disabled={!request || isRefreshing}
            isPending={isRefreshing}
            onClick={() => void handleRefresh()}
            size="sm"
            type="button"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            새로고침
          </Button>
        </div>
      </div>
      {request ? (
        <DataExportStatusCard presentation={presentation} request={request} />
      ) : null}
      {error ? <InlineErrorMessage message={error} /> : null}
    </section>
  );
}

// 기능 : 데이터 export 요청 상태를 compact card로 표시합니다.
function DataExportStatusCard({
  request,
  presentation,
}: {
  readonly request: UserDataExportRequestResponse;
  readonly presentation: AccountDataRequestsPresentation;
}) {
  const cardClassName =
    presentation === "modal"
      ? "border-[#E5E7EB] bg-[#F9FAFB]"
      : "border-[#E2E5EC] bg-[#F8FAFC]";
  const downloadLinkClassName =
    presentation === "modal"
      ? "border-[#D1D5DB] text-[#374151] hover:bg-[#F3F4F6]"
      : "border-[#BFDBFE] text-[#1D4ED8] hover:bg-blue-50";

  return (
    <div
      className={`grid min-w-0 gap-2 rounded-md border px-3 py-3 text-sm ${cardClassName}`}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <StatusBadge presentation={presentation} status={request.status} />
        <span className="min-w-0 break-all font-mono text-xs text-[#64748B]">
          {request.id}
        </span>
      </div>
      <dl className="grid min-w-0 gap-2 text-xs text-[#64748B] md:grid-cols-3">
        <ReadOnlyMetric label="요청일" value={formatDateTime(request.requestedAt)} />
        <ReadOnlyMetric label="형식" value={request.format} />
        <ReadOnlyMetric
          label="만료"
          value={request.expiresAt ? formatDateTime(request.expiresAt) : "-"}
        />
      </dl>
      {request.downloadUrl ? (
        <a
          className={`inline-flex h-8 w-fit max-w-full items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition ${downloadLinkClassName}`}
          href={request.downloadUrl}
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">다운로드</span>
        </a>
      ) : null}
    </div>
  );
}

// 기능 : 계정 삭제 요청 생성과 취소 UI를 렌더링합니다.
function AccountDeletionPanel({
  request,
  onCreated,
  onCancelled,
  presentation,
}: {
  readonly request: AccountDeletionRequestResponse | null;
  readonly onCreated: (request: AccountDeletionRequestResponse) => void;
  readonly onCancelled: (response: {
    readonly status: AccountDeletionRequestStatus;
  }) => void;
  readonly presentation: AccountDataRequestsPresentation;
}) {
  const [confirmInput, setConfirmInput] = useState("");
  const [reasonCode, setReasonCode] = useState("");
  const [reasonMessage, setReasonMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateMyAccountDeletionRequestMutation();
  const cancelMutation = useCancelMyAccountDeletionRequestMutation();
  const hasActiveDeletionRequest =
    request?.status === "REQUESTED" || request?.status === "PROCESSING";
  const canSubmit =
    confirmInput === confirmText &&
    !createMutation.isPending &&
    !hasActiveDeletionRequest;
  const canCancel = request?.status === "REQUESTED";
  const inputClassName = getFieldClassName(presentation, "input");
  const selectClassName = getFieldClassName(presentation, "select");

  // 기능 : 계정 삭제 요청 form 제출을 처리합니다.
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const response = await createMutation.mutateAsync({
        confirmText: confirmInput,
        ...(reasonCode ? { reasonCode } : {}),
        ...(reasonMessage.trim() ? { reasonMessage: reasonMessage.trim() } : {}),
      });
      setConfirmInput("");
      setReasonCode("");
      setReasonMessage("");
      onCreated(response);
    } catch (nextError) {
      setError(getApiErrorMessage(nextError));
    }
  }

  // 기능 : 계정 삭제 요청 취소 버튼 클릭을 처리합니다.
  async function handleCancel() {
    if (!request) {
      return;
    }

    setError(null);

    try {
      const response = await cancelMutation.mutateAsync(request.id);
      onCancelled(response);
    } catch (nextError) {
      setError(getApiErrorMessage(nextError));
    }
  }

  return (
    <section className="grid min-w-0 gap-3">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <PanelTitle
          description="요청 후 30일 유예 기간이 적용돼요"
          icon={Trash2}
          title="계정 삭제 요청"
        />
        {request ? (
          <Button
            disabled={!canCancel || cancelMutation.isPending}
            isPending={cancelMutation.isPending}
            onClick={() => void handleCancel()}
            size="sm"
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            삭제 요청 취소
          </Button>
        ) : null}
      </div>

      {request ? (
        <DeletionStatusCard presentation={presentation} request={request} />
      ) : null}

      <form className="grid min-w-0 gap-3" onSubmit={handleCreate}>
        <label className="grid min-w-0 gap-1.5">
          <span className="text-xs font-medium text-[#64748B]">
            확인 문구
          </span>
          <input
            className={inputClassName}
            onChange={(event) => setConfirmInput(event.target.value)}
            placeholder={confirmText}
            value={confirmInput}
          />
          <p className="text-[12px] leading-5 text-[#6B7280]">
            삭제 요청을 보내려면{" "}
            <span className="break-all font-mono font-semibold text-[#111827]">
              {confirmText}
            </span>
            를 정확히 입력해 주세요. 진행 중인 요청이 있으면 새 요청은
            비활성화돼요.
          </p>
        </label>
        <div className="grid min-w-0 gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-medium text-[#64748B]">사유</span>
            <select
              className={selectClassName}
              onChange={(event) => setReasonCode(event.target.value)}
              value={reasonCode}
            >
              {deletionReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-1.5">
            <span className="text-xs font-medium text-[#64748B]">메모</span>
            <input
              className={inputClassName}
              maxLength={1000}
              onChange={(event) => setReasonMessage(event.target.value)}
              value={reasonMessage}
            />
          </label>
        </div>
        <div className="flex justify-end">
          <Button
            disabled={!canSubmit}
            isPending={createMutation.isPending}
            size="sm"
            type="submit"
            variant="danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            삭제 요청
          </Button>
        </div>
      </form>
      {error ? <InlineErrorMessage message={error} /> : null}
    </section>
  );
}

// 기능 : 계정 삭제 요청 상태를 compact card로 표시합니다.
function DeletionStatusCard({
  request,
  presentation,
}: {
  readonly request: AccountDeletionRequestResponse;
  readonly presentation: AccountDataRequestsPresentation;
}) {
  return (
    <div className="grid min-w-0 gap-2 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-3 text-sm">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <StatusBadge presentation={presentation} status={request.status} />
        <span className="min-w-0 break-all font-mono text-xs text-[#7F1D1D]">
          {request.id}
        </span>
      </div>
      <dl className="grid min-w-0 gap-2 text-xs text-[#7F1D1D] md:grid-cols-3">
        <ReadOnlyMetric label="요청일" value={formatDateTime(request.requestedAt)} />
        <ReadOnlyMetric
          label="삭제 예정"
          value={formatDateTime(request.scheduledDeletionAt)}
        />
        <ReadOnlyMetric
          label="취소 가능"
          value={formatDateTime(request.canCancelUntil)}
        />
      </dl>
    </div>
  );
}

// 기능 : 설정 card header를 계정 데이터 요청 섹션에 맞춰 표시합니다.
function SettingsCardHeader({
  description,
  icon: Icon,
  title,
}: {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EAF2FF] text-[#1D4ED8]">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[20px] font-semibold text-[#111827]">{title}</h2>
        <p className="mt-0.5 text-[12px] text-[#64748B]">{description}</p>
      </div>
    </div>
  );
}

// 기능 : 계정 데이터 요청 panel 제목을 아이콘과 함께 표시합니다.
function PanelTitle({
  description,
  icon: Icon,
  title,
}: {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly title: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" />
      <div className="min-w-0">
        <h3 className="break-words text-sm font-semibold text-[#111827]">
          {title}
        </h3>
        <p className="mt-0.5 break-words text-xs leading-5 text-[#64748B]">
          {description}
        </p>
      </div>
    </div>
  );
}

// 기능 : 요청 status를 색상 badge로 표시합니다.
function StatusBadge({
  status,
  presentation,
}: {
  readonly status: UserDataExportRequestStatus | AccountDeletionRequestStatus;
  readonly presentation: AccountDataRequestsPresentation;
}) {
  const className = getStatusBadgeClassName(status, presentation);

  return (
    <span
      className={`max-w-full break-words rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

// 기능 : 상태별 badge className을 반환합니다.
function getStatusBadgeClassName(
  status: UserDataExportRequestStatus | AccountDeletionRequestStatus,
  presentation: AccountDataRequestsPresentation,
): string {
  if (presentation === "modal") {
    switch (status) {
      case "READY":
        return "bg-[#DCFCE7] text-[#166534]";
      case "FAILED":
      case "COMPLETED":
        return "bg-[#FEE2E2] text-[#991B1B]";
      case "REQUESTED":
      case "PROCESSING":
      case "CANCELLED":
      case "EXPIRED":
      default:
        return "bg-[#F3F4F6] text-[#374151]";
    }
  }

  switch (status) {
    case "READY":
      return "bg-[#DCFCE7] text-[#166534]";
    case "REQUESTED":
    case "PROCESSING":
      return "bg-[#EAF2FF] text-[#1D4ED8]";
    case "CANCELLED":
    case "EXPIRED":
      return "bg-[#F1F5F9] text-[#475569]";
    case "FAILED":
    case "COMPLETED":
      return "bg-[#FEE2E2] text-[#991B1B]";
    default:
      return "bg-[#F1F5F9] text-[#475569]";
  }
}

// 기능 : account request 입력 필드의 표시 className을 반환합니다.
function getFieldClassName(
  presentation: AccountDataRequestsPresentation,
  fieldType: "input" | "select",
) {
  const baseClassName =
    "h-9 min-w-0 rounded-md border border-[#E2E5EC] px-3 text-sm outline-none";
  const fieldClassName =
    fieldType === "select" ? "bg-white text-[#374151]" : "bg-white";
  const focusClassName =
    presentation === "modal"
      ? "focus:border-[#9CA3AF] focus:ring-2 focus:ring-[#F3F4F6]"
      : "focus:border-[#93C5FD]";
  const fontClassName = fieldType === "input" ? "font-mono" : "";

  return `${baseClassName} ${fieldClassName} ${focusClassName} ${fontClassName}`.trim();
}

// 기능 : 읽기 전용 metric label/value를 표시합니다.
function ReadOnlyMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="font-medium">{label}</dt>
      <dd className="mt-0.5 break-words font-semibold text-[#111827]">
        {value}
      </dd>
    </div>
  );
}

// 기능 : API 오류 메시지를 inline으로 표시합니다.
function InlineErrorMessage({ message }: { readonly message: string }) {
  return (
    <p className="break-words rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}

// 기능 : ISO 날짜 문자열을 사용자 설정 화면 표시 형식으로 변환합니다.
function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
