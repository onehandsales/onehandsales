import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ModalShell } from "@/components/ui/modal-shell";
import { ErrorState } from "@/components/ui/state";
import {
  useContactDepartments,
  useContactJobGrades,
} from "@/features/contact/hooks/use-contact-list";
import {
  useCreateDepartmentMutation,
  useCreateJobGradeMutation,
  useDeleteDepartmentMutation,
  useDeleteJobGradeMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import { getApiErrorMessage } from "@/lib/api-client";
import type {
  ContactDepartment,
  ContactJobGrade,
} from "@/features/contact/types/contact";

type ContactTaxonomyManageDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated?: (kind: "department" | "jobGrade", name: string) => void;
};

export function ContactTaxonomyManageDialog({
  open,
  onOpenChange,
  onCreated,
}: ContactTaxonomyManageDialogProps) {
  const departmentsQuery = useContactDepartments();
  const jobGradesQuery = useContactJobGrades();
  const createDepartmentMutation = useCreateDepartmentMutation();
  const createJobGradeMutation = useCreateJobGradeMutation();
  const deleteDepartmentMutation = useDeleteDepartmentMutation();
  const deleteJobGradeMutation = useDeleteJobGradeMutation();
  const [departmentName, setDepartmentName] = useState("");
  const [jobGradeName, setJobGradeName] = useState("");

  const departments = departmentsQuery.data?.items ?? [];
  const jobGrades = jobGradesQuery.data?.items ?? [];
  const actionError =
    createDepartmentMutation.error ??
    createJobGradeMutation.error ??
    deleteDepartmentMutation.error ??
    deleteJobGradeMutation.error ??
    null;

  useEffect(() => {
    if (open) {
      setDepartmentName("");
      setJobGradeName("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const createDepartment = async () => {
    const name = departmentName.trim();
    if (!name) {
      return;
    }

    await createDepartmentMutation.mutateAsync({ departmentName: name });
    await departmentsQuery.refetch();
    onCreated?.("department", name);
    setDepartmentName("");
  };

  const createJobGrade = async () => {
    const name = jobGradeName.trim();
    if (!name) {
      return;
    }

    await createJobGradeMutation.mutateAsync({ jobGradeName: name });
    await jobGradesQuery.refetch();
    onCreated?.("jobGrade", name);
    setJobGradeName("");
  };

  const deleteDepartment = async (department: ContactDepartment) => {
    if (!window.confirm(`${department.departmentName} 부서를 삭제할까요?`)) {
      return;
    }

    await deleteDepartmentMutation.mutateAsync(department.id);
    await departmentsQuery.refetch();
  };

  const deleteJobGrade = async (jobGrade: ContactJobGrade) => {
    if (!window.confirm(`${jobGrade.jobGradeName} 직급을 삭제할까요?`)) {
      return;
    }

    await deleteJobGradeMutation.mutateAsync(jobGrade.id);
    await jobGradesQuery.refetch();
  };

  return (
    <ModalShell
      description="부서와 직급을 추가하거나 삭제합니다."
      open={open}
      size="lg"
      title="거래처 분류 관리"
      onOpenChange={onOpenChange}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TaxonomySection
          error={createDepartmentMutation.error}
          items={departments}
          isPending={createDepartmentMutation.isPending}
          name={departmentName}
          onAdd={() => void createDepartment()}
          onDelete={(item) => void deleteDepartment(item as ContactDepartment)}
          onNameChange={setDepartmentName}
          placeholder="예: 영업팀"
          title="부서"
          type="department"
        />
        <TaxonomySection
          error={createJobGradeMutation.error}
          items={jobGrades}
          isPending={createJobGradeMutation.isPending}
          name={jobGradeName}
          onAdd={() => void createJobGrade()}
          onDelete={(item) => void deleteJobGrade(item as ContactJobGrade)}
          onNameChange={setJobGradeName}
          placeholder="예: 과장"
          title="직급"
          type="jobGrade"
        />
        {actionError ? (
          <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive md:col-span-2">
            {getApiErrorMessage(actionError)}
          </p>
        ) : null}
      </div>
    </ModalShell>
  );
}

function TaxonomySection({
  title,
  placeholder,
  name,
  onNameChange,
  onAdd,
  onDelete,
  items,
  isPending,
  error,
  type,
}: {
  readonly title: string;
  readonly placeholder: string;
  readonly name: string;
  readonly onNameChange: (value: string) => void;
  readonly onAdd: () => void;
  readonly onDelete: (item: ContactDepartment | ContactJobGrade) => void;
  readonly items: Array<ContactDepartment | ContactJobGrade>;
  readonly isPending: boolean;
  readonly error: unknown;
  readonly type: "department" | "jobGrade";
}) {
  return (
    <div className="grid content-start gap-3 rounded-lg border border-[#E5EAF0] bg-white p-4">
      <div>
        <h3 className="text-[14px] font-semibold text-[#111827]">{title}</h3>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          추가하거나 잘못 들어간 항목을 삭제합니다.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          className="h-10 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={placeholder}
          value={name}
        />
        <button
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-[#2563EB] px-3 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
          disabled={isPending || name.trim().length === 0}
          onClick={onAdd}
          type="button"
        >
          + 추가
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-sm text-muted-foreground">등록된 항목이 없습니다.</span>
        ) : (
          items.map((item) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[12px] text-[#374151]"
              key={item.id}
            >
              <span className="max-w-40 truncate">
                {type === "department"
                  ? (item as ContactDepartment).departmentName
                  : (item as ContactJobGrade).jobGradeName}
              </span>
              <button
                aria-label={`${
                  type === "department"
                    ? (item as ContactDepartment).departmentName
                    : (item as ContactJobGrade).jobGradeName
                } 삭제`}
                className="grid h-5 w-5 place-items-center rounded-full text-[#9CA3AF] hover:bg-white hover:text-[#EF4444]"
                disabled={isPending}
                onClick={() => onDelete(item)}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      {error ? (
        <ErrorState
          message={getApiErrorMessage(error)}
          title={`${title} 오류`}
          variant="inline"
        />
      ) : null}
    </div>
  );
}
