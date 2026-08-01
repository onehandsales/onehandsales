import {
  AlertTriangle,
  CheckCircle2,
  Database,
  RefreshCcw,
  Save,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import {
  useCreateAdminOperationCheckRunMutation,
  useLatestAdminOperationCheckRun,
} from "../hooks/use-admin-system-operation";
import type {
  AdminOperationCheckEnvironment,
  AdminOperationCheckItems,
  AdminOperationCheckRun,
  AdminOperationCheckStatus,
} from "../types/admin-system-operation";

const statusOptions: readonly AdminOperationCheckStatus[] = [
  "PASS",
  "WARN",
  "FAIL",
];
const environmentOptions: readonly AdminOperationCheckEnvironment[] = [
  "local",
  "qa",
  "staging",
  "production",
];
const checkItemDefinitions = [
  { key: "prismaValidate", label: "Prisma validate" },
  { key: "prismaGenerate", label: "Prisma generate" },
  { key: "migrationStatus", label: "Migration status" },
  { key: "seedNotRunOnSharedDb", label: "Seed not run on shared DB" },
  { key: "backupVerified", label: "Backup verified" },
  { key: "restoreDryRun", label: "Restore dry-run" },
  { key: "providerSmoke", label: "Provider smoke" },
] as const;
const defaultItems: AdminOperationCheckItems = {
  prismaValidate: "PASS",
  prismaGenerate: "PASS",
  migrationStatus: "PASS",
  seedNotRunOnSharedDb: "PASS",
  backupVerified: "PASS",
  restoreDryRun: "WARN",
  providerSmoke: "WARN",
};
const secretNotePatterns = [
  /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/\S+/i,
  /\b(?:DATABASE_URL|DB_URL|SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|ACCESS_TOKEN|REFRESH_TOKEN|API_KEY|SECRET|TOKEN|PASSWORD)\b\s*[:=]\s*\S+/i,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/i,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/i,
];

// 기능 : Admin 운영 gate 최신 상태와 점검 기록 form을 렌더링합니다.
export function AdminSystemOperationScreen() {
  const latestQuery = useLatestAdminOperationCheckRun();
  const createMutation = useCreateAdminOperationCheckRunMutation();
  const [environment, setEnvironment] =
    useState<AdminOperationCheckEnvironment>("production");
  const [status, setStatus] = useState<AdminOperationCheckStatus>("PASS");
  const [items, setItems] = useState<AdminOperationCheckItems>(defaultItems);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const latestRun = latestQuery.data ?? null;
  const itemSummary = useMemo(() => summarizeItems(items), [items]);

  // 기능 : 운영 gate 점검 기록 form 제출을 처리합니다.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedNotes = notes.trim();

    if (containsSecretLikeValue(normalizedNotes)) {
      setFormError("메모에는 DB URL, token, secret 값을 저장할 수 없어요.");
      return;
    }

    setFormError(null);

    try {
      await createMutation.mutateAsync({
        environment,
        status,
        items,
        ...(normalizedNotes ? { notes: normalizedNotes } : {}),
      });
    } catch (error) {
      setFormError(getAdminErrorMessage(error));
    }
  }

  // 기능 : 점검 항목 status 변경을 form state에 반영합니다.
  function handleItemStatusChange(
    key: keyof AdminOperationCheckItems,
    nextStatus: AdminOperationCheckStatus
  ) {
    setItems((current) => ({
      ...current,
      [key]: nextStatus,
    }));
  }

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            System operation
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">
            운영 gate
          </h1>
        </div>
        <button
          aria-label="최신 점검 새로고침"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium text-muted-foreground hover:bg-muted"
          title="최신 점검 새로고침"
          type="button"
          onClick={() => void latestQuery.refetch()}
        >
          <RefreshCcw className="h-4 w-4" />
          새로고침
        </button>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid min-w-0 content-start gap-4">
          <LatestOperationCheckPanel
            isError={latestQuery.isError}
            isLoading={latestQuery.isLoading}
            latestRun={latestRun}
            onRetry={() => void latestQuery.refetch()}
          />
          <CheckItemStatusTable items={items} summary={itemSummary} />
        </section>

        <form
          className="grid content-start gap-4 rounded-lg border bg-white p-4"
          onSubmit={handleSubmit}
        >
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <h2 className="text-sm font-semibold">점검 기록</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                DB URL, token, secret 값은 저장 전에 차단돼요
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <FormSelect
              label="환경"
              options={environmentOptions}
              value={environment}
              onChange={(value) =>
                setEnvironment(value as AdminOperationCheckEnvironment)
              }
            />
            <FormSelect
              label="전체 상태"
              options={statusOptions}
              value={status}
              onChange={(value) => setStatus(value as AdminOperationCheckStatus)}
            />
          </div>

          <div className="grid gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              항목 상태
            </span>
            <div className="grid gap-2">
              {checkItemDefinitions.map((item) => (
                <FormSelect
                  key={item.key}
                  label={item.label}
                  options={statusOptions}
                  value={items[item.key]}
                  onChange={(value) =>
                    handleItemStatusChange(
                      item.key,
                      value as AdminOperationCheckStatus
                    )
                  }
                />
              ))}
            </div>
          </div>

          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            <span>메모</span>
            <textarea
              className="min-h-28 resize-y rounded-md border bg-white px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              maxLength={2000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          {formError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              disabled={createMutation.isPending}
              type="submit"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? "저장 중" : "기록 저장"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

// 기능 : 최신 운영 gate 점검 상태 panel을 렌더링합니다.
function LatestOperationCheckPanel({
  latestRun,
  isLoading,
  isError,
  onRetry,
}: {
  readonly latestRun: AdminOperationCheckRun | null;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div className="grid min-h-44 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
        최신 운영 gate 상태를 불러오고 있어요
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
        <p className="text-sm text-muted-foreground">
          최신 운영 gate 상태를 불러오지 못했어요
        </p>
        <button
          className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          type="button"
          onClick={onRetry}
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!latestRun) {
    return (
      <div className="grid min-h-44 gap-2 rounded-lg border bg-white p-5">
        <PanelTitle
          icon={Database}
          title="최신 점검 없음"
          description="첫 운영 gate 점검 결과를 기록하면 여기에 표시돼요"
        />
      </div>
    );
  }

  return (
    <section className="grid gap-4 rounded-lg border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelTitle
          icon={Database}
          title="최신 운영 gate"
          description={`${latestRun.environment} · ${formatDateTime(latestRun.checkedAt)}`}
        />
        <StatusBadge status={latestRun.status} />
      </div>
      <dl className="grid gap-3 md:grid-cols-3">
        <ReadOnlyMetric label="환경" value={latestRun.environment} />
        <ReadOnlyMetric
          label="관리자"
          value={latestRun.checkedByAdminUserId}
        />
        <ReadOnlyMetric label="점검일" value={formatDateTime(latestRun.checkedAt)} />
      </dl>
      <CheckItemStatusTable items={latestRun.items} />
      {latestRun.notes ? (
        <p className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
          {latestRun.notes}
        </p>
      ) : null}
    </section>
  );
}

// 기능 : 운영 gate 항목별 status table을 렌더링합니다.
function CheckItemStatusTable({
  items,
  summary,
}: {
  readonly items: AdminOperationCheckItems;
  readonly summary?: Record<AdminOperationCheckStatus, number>;
}) {
  return (
    <section className="overflow-hidden rounded-lg border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/50 px-4 py-2">
        <h2 className="text-sm font-semibold">체크리스트</h2>
        {summary ? (
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>PASS {summary.PASS}</span>
            <span>WARN {summary.WARN}</span>
            <span>FAIL {summary.FAIL}</span>
          </div>
        ) : null}
      </div>
      <div className="divide-y">
        {checkItemDefinitions.map((item) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_110px] items-center gap-3 px-4 py-3 text-sm"
            key={item.key}
          >
            <span className="truncate font-medium">{item.label}</span>
            <StatusBadge status={items[item.key]} />
          </div>
        ))}
      </div>
    </section>
  );
}

// 기능 : 운영 gate form select를 렌더링합니다.
function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: readonly string[];
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <select
        className="h-9 rounded-md border bg-white px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

// 기능 : 운영 gate panel 제목을 아이콘과 함께 렌더링합니다.
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
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// 기능 : 읽기 전용 metric label/value를 렌더링합니다.
function ReadOnlyMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0 rounded-md border bg-muted/20 px-3 py-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold">{value}</dd>
    </div>
  );
}

// 기능 : 운영 gate status badge를 렌더링합니다.
function StatusBadge({ status }: { readonly status: AdminOperationCheckStatus }) {
  const Icon = getStatusIcon(status);

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${getStatusClassName(status)}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

// 기능 : 운영 gate status별 icon을 반환합니다.
function getStatusIcon(status: AdminOperationCheckStatus) {
  switch (status) {
    case "PASS":
      return CheckCircle2;
    case "WARN":
      return AlertTriangle;
    case "FAIL":
      return XCircle;
    default:
      return AlertTriangle;
  }
}

// 기능 : 운영 gate status별 badge className을 반환합니다.
function getStatusClassName(status: AdminOperationCheckStatus): string {
  switch (status) {
    case "PASS":
      return "bg-emerald-50 text-emerald-700";
    case "WARN":
      return "bg-amber-50 text-amber-700";
    case "FAIL":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// 기능 : 운영 gate 항목 상태 수를 집계합니다.
function summarizeItems(
  items: AdminOperationCheckItems
): Record<AdminOperationCheckStatus, number> {
  return Object.values(items).reduce(
    (summary, status) => ({
      ...summary,
      [status]: summary[status] + 1,
    }),
    { PASS: 0, WARN: 0, FAIL: 0 }
  );
}

// 기능 : notes에 DB URL 또는 token 의심값이 포함됐는지 검사합니다.
function containsSecretLikeValue(value: string): boolean {
  return secretNotePatterns.some((pattern) => pattern.test(value));
}

// 기능 : Admin API 오류를 운영자가 볼 수 있는 메시지로 변환합니다.
function getAdminErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "운영 gate 점검 기록을 저장하지 못했어요";
}

// 기능 : ISO 문자열을 Admin 운영 gate 표시용 날짜·시간으로 변환합니다.
function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
