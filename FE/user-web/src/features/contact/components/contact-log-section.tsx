import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, MessageSquareText, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  useCreateContactMemoLogMutation,
  useCreateContactPrivateMemoLogMutation,
  useUpdateContactMemoLogMutation,
  useUpdateContactPrivateMemoLogMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import {
  contactMemoLogFormSchema,
  contactPrivateMemoLogFormSchema,
  emptyContactMemoLogFormValues,
  emptyContactPrivateMemoLogFormValues,
  toCreateContactMemoLogInput,
  toCreateContactPrivateMemoLogInput,
  toUpdateContactMemoLogInput,
  toUpdateContactPrivateMemoLogInput,
  type ContactMemoLogFormValues,
  type ContactPrivateMemoLogFormValues,
} from "@/features/contact/schemas/contact-schema";
import type {
  ContactMemoLog,
  ContactPrivateMemoLog,
} from "@/features/contact/types/contact";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

type ContactMemoLogSectionProps = {
  readonly contactId: string;
  readonly logs: ContactMemoLog[];
  readonly isLoading: boolean;
  readonly isFetchingNextPage: boolean;
  readonly hasNextPage: boolean;
  readonly error: unknown;
  readonly onFetchMore: () => void;
  readonly onRetry: () => void;
  readonly onChanged: (notice: string) => void;
};

// 기능 : 담당자 일반 메모 로그 목록과 생성/수정 폼을 렌더링합니다.
export function ContactMemoLogSection({
  contactId,
  logs,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  error,
  onFetchMore,
  onRetry,
  onChanged,
}: ContactMemoLogSectionProps) {
  const [editingLog, setEditingLog] = useState<ContactMemoLog | null>(null);
  const createMemoMutation = useCreateContactMemoLogMutation(contactId);
  const updateMemoMutation = useUpdateContactMemoLogMutation(contactId);
  const createForm = useForm<ContactMemoLogFormValues>({
    resolver: zodResolver(contactMemoLogFormSchema),
    defaultValues: emptyContactMemoLogFormValues,
  });
  const editForm = useForm<ContactMemoLogFormValues>({
    resolver: zodResolver(contactMemoLogFormSchema),
    defaultValues: emptyContactMemoLogFormValues,
  });
  const actionError = createMemoMutation.error ?? updateMemoMutation.error ?? null;

  // 기능 : 일반 메모 로그를 생성합니다.
  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    await createMemoMutation.mutateAsync(
      toCreateContactMemoLogInput(contactId, values)
    );
    createForm.reset(emptyContactMemoLogFormValues);
      onChanged("담당자 메모를 추가했어요.");
  });

  // 기능 : 일반 메모 로그 수정 폼을 엽니다.
  const onEditStart = (log: ContactMemoLog) => {
    setEditingLog(log);
    editForm.reset({
      memoType: log.memoType,
      memo: log.memo,
    });
  };

  // 기능 : 일반 메모 로그를 수정합니다.
  const onEditSubmit = editForm.handleSubmit(async (values) => {
    if (!editingLog) {
      return;
    }

    await updateMemoMutation.mutateAsync(
      toUpdateContactMemoLogInput(contactId, editingLog.id, values)
    );
    setEditingLog(null);
      onChanged("담당자 메모를 수정했어요.");
  });

  return (
    <section className="grid gap-4">
      <SectionTitle
      description="담당자 공유 메모예요."
        icon={MessageSquareText}
        title="담당자 메모"
      />
      <div className="grid gap-4 rounded-lg border bg-white p-4">
        <form className="grid gap-3" onSubmit={(e) => void onCreateSubmit(e)}>
          {/* 1행: 메모 유형 + 추가 버튼 */}
          <div className="flex items-center gap-2">
            <input
              aria-describedby={
                createForm.formState.errors.memoType
                  ? "contact-memo-type-error"
                  : undefined
              }
              aria-invalid={Boolean(createForm.formState.errors.memoType)}
              className="h-9 flex-1 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:bg-white"
              id="contact-memo-type"
              placeholder="메모 제목"
              {...createForm.register("memoType")}
            />
            <Button
              disabled={createMemoMutation.isPending}
              isPending={createMemoMutation.isPending}
              type="submit"
              variant="primary"
            >
              추가
            </Button>
          </div>
          {/* 2행: 메모 상세 내용 */}
          <textarea
            aria-describedby={
              createForm.formState.errors.memo
                ? "contact-memo-error"
                : undefined
            }
            aria-invalid={Boolean(createForm.formState.errors.memo)}
            className="min-h-[80px] resize-y rounded-md border border-[#E2E5EC] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:bg-white"
            id="contact-memo"
            placeholder="메모 상세 내용"
            {...createForm.register("memo")}
          />
          <FormError
            id="contact-memo-type-error"
            message={createForm.formState.errors.memoType?.message}
          />
          <FormError
            id="contact-memo-error"
            message={createForm.formState.errors.memo?.message}
          />
          {actionError ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(actionError)}
            </p>
          ) : null}
        </form>

        {editingLog ? (
          <form className="grid gap-3 rounded-md border bg-muted p-3" onSubmit={(e) => void onEditSubmit(e)}>
            <div className="flex items-center gap-2">
              <input
                aria-label="수정할 메모 유형"
                className="h-9 flex-1 rounded-md border bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring"
                placeholder="메모 제목"
                {...editForm.register("memoType")}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditingLog(null)}
                  type="button"
                >
            닫기
                </Button>
                <Button
                  disabled={updateMemoMutation.isPending}
                  isPending={updateMemoMutation.isPending}
                  type="submit"
                  variant="primary"
                >
                  저장
                </Button>
              </div>
            </div>
            <textarea
              aria-label="수정할 메모"
              className="min-h-[80px] resize-y rounded-md border bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-ring"
              placeholder="메모 상세 내용"
              {...editForm.register("memo")}
            />
            <FormError message={editForm.formState.errors.memoType?.message} />
            <FormError message={editForm.formState.errors.memo?.message} />
          </form>
        ) : null}

        <MemoLogList
        emptyText="담당자 메모를 추가하면 여기에서 볼 수 있어요."
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          logs={logs.map((log) => ({
            id: log.id,
            createdAt: log.createdAt,
            label: log.memoType,
            memo: log.memo,
            onEdit: () => onEditStart(log),
          }))}
          onFetchMore={onFetchMore}
          onRetry={onRetry}
        />
      </div>
    </section>
  );
}

type ContactPrivateMemoLogSectionProps = {
  readonly contactId: string;
  readonly logs: ContactPrivateMemoLog[];
  readonly isLoading: boolean;
  readonly isFetchingNextPage: boolean;
  readonly hasNextPage: boolean;
  readonly error: unknown;
  readonly onFetchMore: () => void;
  readonly onRetry: () => void;
  readonly onChanged: (notice: string) => void;
};

// 기능 : 담당자 비공식 메모 로그 목록과 생성/수정 폼을 렌더링합니다.
export function ContactPrivateMemoLogSection({
  contactId,
  logs,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  error,
  onFetchMore,
  onRetry,
  onChanged,
}: ContactPrivateMemoLogSectionProps) {
  const [editingLog, setEditingLog] = useState<ContactPrivateMemoLog | null>(null);
  const createMemoMutation = useCreateContactPrivateMemoLogMutation(contactId);
  const updateMemoMutation = useUpdateContactPrivateMemoLogMutation(contactId);
  const createForm = useForm<ContactPrivateMemoLogFormValues>({
    resolver: zodResolver(contactPrivateMemoLogFormSchema),
    defaultValues: emptyContactPrivateMemoLogFormValues,
  });
  const editForm = useForm<ContactPrivateMemoLogFormValues>({
    resolver: zodResolver(contactPrivateMemoLogFormSchema),
    defaultValues: emptyContactPrivateMemoLogFormValues,
  });
  const actionError = createMemoMutation.error ?? updateMemoMutation.error ?? null;

  // 기능 : 비공식 메모 로그를 생성합니다.
  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    await createMemoMutation.mutateAsync(
      toCreateContactPrivateMemoLogInput(contactId, values)
    );
    createForm.reset(emptyContactPrivateMemoLogFormValues);
      onChanged("비공식 메모를 추가했어요.");
  });

  // 기능 : 비공식 메모 로그 수정 폼을 엽니다.
  const onEditStart = (log: ContactPrivateMemoLog) => {
    setEditingLog(log);
    editForm.reset({
      memo: log.memo,
    });
  };

  // 기능 : 비공식 메모 로그를 수정합니다.
  const onEditSubmit = editForm.handleSubmit(async (values) => {
    if (!editingLog) {
      return;
    }

    await updateMemoMutation.mutateAsync(
      toUpdateContactPrivateMemoLogInput(contactId, editingLog.id, values)
    );
    setEditingLog(null);
      onChanged("비공식 메모를 수정했어요.");
  });

  return (
    <section className="grid gap-4">
      <div>
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">비공식 메모</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          파일로 내보낼 때 비공식 메모 내용을 제외할 수 있어요.
        </p>
      </div>
      <div className="grid gap-4 rounded-lg border bg-white p-4">
        <form className="grid gap-3" onSubmit={(e) => void onCreateSubmit(e)}>
          <div className="flex items-center gap-2">
            <textarea
              aria-describedby={
                createForm.formState.errors.memo
                  ? "contact-private-memo-error"
                  : undefined
              }
              aria-invalid={Boolean(createForm.formState.errors.memo)}
              className="min-h-[80px] flex-1 resize-y rounded-md border border-[#E2E5EC] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:bg-white"
              id="contact-private-memo"
              placeholder="메모 상세 내용"
              {...createForm.register("memo")}
            />
            <div className="self-end">
              <Button
                disabled={createMemoMutation.isPending}
                isPending={createMemoMutation.isPending}
                type="submit"
                variant="primary"
              >
                추가
              </Button>
            </div>
          </div>
          <FormError
            id="contact-private-memo-error"
            message={createForm.formState.errors.memo?.message}
          />
          {actionError ? (
            <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              {getApiErrorMessage(actionError)}
            </p>
          ) : null}
        </form>

        {editingLog ? (
          <form className="grid gap-3 rounded-md border bg-muted p-3" onSubmit={(e) => void onEditSubmit(e)}>
            <div className="flex items-start gap-2">
              <textarea
                aria-label="수정할 비공식 메모"
                className="min-h-[80px] flex-1 resize-y rounded-md border bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-ring"
                placeholder="메모 상세 내용"
                {...editForm.register("memo")}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setEditingLog(null)}
                  type="button"
                >
            닫기
                </Button>
                <Button
                  disabled={updateMemoMutation.isPending}
                  isPending={updateMemoMutation.isPending}
                  type="submit"
                  variant="primary"
                >
                  저장
                </Button>
              </div>
            </div>
            <FormError message={editForm.formState.errors.memo?.message} />
          </form>
        ) : null}

        <MemoLogList
        emptyText="비공식 메모를 추가하면 여기에서 볼 수 있어요."
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          logs={logs.map((log) => ({
            id: log.id,
            createdAt: log.createdAt,
            label: "비공식 메모",
            memo: log.memo,
            onEdit: () => onEditStart(log),
          }))}
          onFetchMore={onFetchMore}
          onRetry={onRetry}
        />
      </div>
    </section>
  );
}

type MemoLogListProps = {
  readonly logs: Array<{
    readonly id: string;
    readonly createdAt: string;
    readonly label: string;
    readonly memo: string;
    readonly onEdit: () => void;
  }>;
  readonly emptyText: string;
  readonly isLoading: boolean;
  readonly isFetchingNextPage: boolean;
  readonly hasNextPage: boolean;
  readonly error: unknown;
  readonly onFetchMore: () => void;
  readonly onRetry: () => void;
};

// 기능 : 메모 로그 목록, 오류, 더 보기 상태를 렌더링합니다.
function MemoLogList({
  logs,
  emptyText,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  error,
  onFetchMore,
  onRetry,
}: MemoLogListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="h-20 animate-pulse rounded-md bg-muted" key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid justify-items-start gap-3 rounded-md border border-destructive/30 bg-red-50 p-4">
        <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
        <Button onClick={onRetry} size="sm" type="button">
          다시 시도
        </Button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="rounded-md border bg-muted px-3 py-4 text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="divide-y overflow-hidden rounded-md border">
        {logs.map((log) => (
          <article className="grid gap-2 bg-white px-4 py-4" key={log.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="max-w-48 truncate rounded-md bg-muted px-2 py-1 text-xs font-medium">
                  {log.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(log.createdAt, { includeYear: true })}
                </span>
              </div>
              <button
                className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium hover:bg-muted"
                onClick={log.onEdit}
                type="button"
              >
                <Pencil className="h-3.5 w-3.5" />
                수정
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {log.memo}
            </p>
          </article>
        ))}
      </div>
      {hasNextPage ? (
        <Button
          disabled={isFetchingNextPage}
          isPending={isFetchingNextPage}
          onClick={onFetchMore}
          type="button"
        >
          {isFetchingNextPage ? "불러오는 중" : "더 보기"}
        </Button>
      ) : null}
    </div>
  );
}

type SectionTitleProps = {
  readonly title: string;
  readonly description: string;
  readonly icon: typeof MessageSquareText;
};

// 기능 : 메모 섹션 제목을 렌더링합니다.
function SectionTitle({ title, description, icon: Icon }: SectionTitleProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// 기능 : 폼 검증 오류를 렌더링합니다.
function FormError({
  id,
  message,
}: {
  readonly id?: string;
  readonly message?: string;
}) {
  return message ? (
    <p className="text-xs text-destructive" id={id}>
      {message}
    </p>
  ) : null;
}
