import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateCompanyLogMutation,
  useDeleteCompanyLogMutation,
  useUpdateCompanyLogMutation,
} from "@/features/company/hooks/use-company-mutations";
import {
  companyLogFormSchema,
  toCreateCompanyLogInput,
  toDateTimeLocalValue,
  toUpdateCompanyLogInput,
  type CompanyLogFormValues,
} from "@/features/company/schemas/company-schema";
import type { CompanyLog } from "@/features/company/types/company";
import { getApiErrorMessage } from "@/lib/api-client";

type CompanyLogSectionProps = {
  readonly companyId: string;
  readonly logs: CompanyLog[];
  readonly onChanged: (message: string) => void;
};

export function CompanyLogSection({
  companyId,
  logs,
  onChanged,
}: CompanyLogSectionProps) {
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const createLogMutation = useCreateCompanyLogMutation();
  const updateLogMutation = useUpdateCompanyLogMutation();
  const deleteLogMutation = useDeleteCompanyLogMutation(companyId);
  const editingLog = useMemo(
    () => logs.find((log) => log.id === editingLogId) ?? null,
    [editingLogId, logs]
  );
  const createForm = useForm<CompanyLogFormValues>({
    resolver: zodResolver(companyLogFormSchema),
    defaultValues: getEmptyLogValues(),
  });
  const editForm = useForm<CompanyLogFormValues>({
    resolver: zodResolver(companyLogFormSchema),
    defaultValues: getEmptyLogValues(),
  });

  useEffect(() => {
    if (editingLog) {
      editForm.reset({
        loggedAt: toDateTimeLocalValue(editingLog.loggedAt),
        title: editingLog.title,
        content: editingLog.content,
      });
    }
  }, [editForm, editingLog]);

  const onCreate = createForm.handleSubmit(async (values) => {
    await createLogMutation.mutateAsync(toCreateCompanyLogInput(companyId, values));
    createForm.reset(getEmptyLogValues());
    onChanged("회사 로그가 추가되었습니다.");
  });

  const onUpdate = editForm.handleSubmit(async (values) => {
    if (!editingLog) {
      return;
    }

    await updateLogMutation.mutateAsync(
      toUpdateCompanyLogInput(companyId, editingLog.id, values)
    );
    setEditingLogId(null);
    onChanged("회사 로그가 수정되었습니다.");
  });

  const onDelete = async (logId: string) => {
    await deleteLogMutation.mutateAsync(logId);
    onChanged("회사 로그가 삭제되었습니다.");
  };

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-lg font-semibold">회사 로그</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          회사 자체의 변경, 소식, 이력을 기록합니다.
        </p>
      </div>

      <form className="grid gap-3 rounded-lg border bg-white p-4" onSubmit={onCreate}>
        <div className="grid gap-3 md:grid-cols-[180px_1fr]">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="company-log-date">
              기록 시간
            </label>
            <input
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-log-date"
              type="datetime-local"
              {...createForm.register("loggedAt")}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="company-log-title">
              제목
            </label>
            <input
              aria-describedby={
                createForm.formState.errors.title
                  ? "company-log-title-error"
                  : undefined
              }
              aria-invalid={Boolean(createForm.formState.errors.title)}
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-log-title"
              {...createForm.register("title")}
            />
            {createForm.formState.errors.title ? (
              <p className="text-xs text-destructive" id="company-log-title-error">
                {createForm.formState.errors.title.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="company-log-content">
            내용
          </label>
          <textarea
            className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="company-log-content"
            {...createForm.register("content")}
          />
        </div>

        {createLogMutation.error ? (
          <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {getApiErrorMessage(createLogMutation.error)}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createLogMutation.isPending}
            type="submit"
          >
            <Plus className="h-4 w-4" />
            로그 추가
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        {logs.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            등록된 회사 로그가 없습니다.
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <article className="grid gap-3 px-4 py-4" key={log.id}>
                {editingLogId === log.id ? (
                  <form className="grid gap-3" onSubmit={onUpdate}>
                    <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                      <input
                        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        type="datetime-local"
                        {...editForm.register("loggedAt")}
                      />
                      <input
                        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        {...editForm.register("title")}
                      />
                    </div>
                    <textarea
                      className="min-h-20 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      {...editForm.register("content")}
                    />
                    {updateLogMutation.error ? (
                      <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
                        {getApiErrorMessage(updateLogMutation.error)}
                      </p>
                    ) : null}
                    <div className="flex justify-end gap-2">
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
                        onClick={() => setEditingLogId(null)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                        취소
                      </button>
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={updateLogMutation.isPending}
                        type="submit"
                      >
                        <Check className="h-4 w-4" />
                        저장
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(log.loggedAt)}
                        </p>
                        <h3 className="mt-1 text-sm font-semibold">{log.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
                          onClick={() => setEditingLogId(log.id)}
                          type="button"
                        >
                          <Pencil className="h-4 w-4" />
                          수정
                        </button>
                        <button
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={deleteLogMutation.isPending}
                          onClick={() => void onDelete(log.id)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </button>
                      </div>
                    </div>
                    {log.content ? (
                      <p className="text-sm leading-6 text-slate-700">{log.content}</p>
                    ) : null}
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {deleteLogMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(deleteLogMutation.error)}
        </p>
      ) : null}
    </section>
  );
}

function getEmptyLogValues(): CompanyLogFormValues {
  return {
    loggedAt: toDateTimeLocalValue(new Date()),
    title: "",
    content: "",
  };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
