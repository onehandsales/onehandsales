import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ModalShell } from "@/components/ui/modal-shell";
import { ErrorState } from "@/components/ui/state";
import {
  useCreateCompanyFieldMutation,
  useCreateCompanyRegionMutation,
  useDeleteCompanyFieldMutation,
  useDeleteCompanyRegionMutation,
} from "@/features/company/hooks/use-company-mutations";
import { getApiErrorMessage } from "@/lib/api-client";
import type { CompanyField, CompanyRegion } from "@/features/company/types/company";

type CompanyTaxonomyCreateDialogProps = {
  readonly open: boolean;
  readonly kind: "field" | "region";
  readonly fields: CompanyField[];
  readonly regions: CompanyRegion[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (name: string) => void;
};

export function CompanyTaxonomyCreateDialog({
  open,
  kind,
  fields,
  regions,
  onOpenChange,
  onCreated,
}: CompanyTaxonomyCreateDialogProps) {
  const createFieldMutation = useCreateCompanyFieldMutation();
  const createRegionMutation = useCreateCompanyRegionMutation();
  const deleteFieldMutation = useDeleteCompanyFieldMutation();
  const deleteRegionMutation = useDeleteCompanyRegionMutation();
  const [fieldName, setFieldName] = useState("");
  const [regionName, setRegionName] = useState("");

  useEffect(() => {
    if (open) {
      setFieldName("");
      setRegionName("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const sections =
    kind === "region"
      ? [
          { key: "region" as const, title: "회사 지역", placeholder: "예: 서울", value: regionName, setValue: setRegionName },
          { key: "field" as const, title: "회사 분야", placeholder: "예: IT/소프트웨어", value: fieldName, setValue: setFieldName },
        ]
      : [
          { key: "field" as const, title: "회사 분야", placeholder: "예: IT/소프트웨어", value: fieldName, setValue: setFieldName },
          { key: "region" as const, title: "회사 지역", placeholder: "예: 서울", value: regionName, setValue: setRegionName },
        ];

  const addField = async () => {
    const name = fieldName.trim();
    if (!name) {
      return;
    }

    await createFieldMutation.mutateAsync({ field: name });
    onCreated(name);
    setFieldName("");
  };

  const addRegion = async () => {
    const name = regionName.trim();
    if (!name) {
      return;
    }

    await createRegionMutation.mutateAsync({ region: name });
    onCreated(name);
    setRegionName("");
  };

  return (
    <ModalShell
      open={open}
      size="lg"
      title="회사 분류 관리"
      onOpenChange={onOpenChange}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div className="grid gap-3 rounded-lg border border-[#E5EAF0] bg-white p-4" key={section.key}>
            <div>
              <h3 className="text-[14px] font-semibold text-[#111827]">
                {section.title}
              </h3>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                추가하거나 잘못 들어간 항목을 삭제합니다.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                className="h-10 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                onChange={(event) => section.setValue(event.target.value)}
                placeholder={section.placeholder}
                value={section.value}
              />
              <button
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-[#4880EE] px-3 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                disabled={
                  section.key === "field"
                    ? createFieldMutation.isPending
                    : createRegionMutation.isPending
                }
                onClick={() => {
                  void (section.key === "field" ? addField() : addRegion());
                }}
                type="button"
              >
                추가
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(section.key === "field" ? fields : regions).map((item) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[12px] text-[#374151]"
                  key={item.id}
                >
                  <span className="max-w-40 truncate">
                    {section.key === "field"
                      ? (item as CompanyField).field
                      : (item as CompanyRegion).region}
                  </span>
                  <button
                    aria-label={`${
                      section.key === "field"
                        ? (item as CompanyField).field
                        : (item as CompanyRegion).region
                    } 삭제`}
                    className="grid h-5 w-5 place-items-center rounded-full text-[#9CA3AF] hover:bg-white hover:text-[#EF4444]"
                    disabled={
                      section.key === "field"
                        ? deleteFieldMutation.isPending
                        : deleteRegionMutation.isPending
                    }
                    onClick={() => {
                      if (section.key === "field") {
                        void deleteFieldMutation.mutateAsync(item.id);
                      } else {
                        void deleteRegionMutation.mutateAsync(item.id);
                      }
                    }}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {section.key === "field" && createFieldMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createFieldMutation.error)}
                title="회사 분야 추가 실패"
                variant="inline"
              />
            ) : null}
            {section.key === "region" && createRegionMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(createRegionMutation.error)}
                title="회사 지역 추가 실패"
                variant="inline"
              />
            ) : null}
            {section.key === "field" && deleteFieldMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(deleteFieldMutation.error)}
                title="회사 분야 삭제 실패"
                variant="inline"
              />
            ) : null}
            {section.key === "region" && deleteRegionMutation.error ? (
              <ErrorState
                message={getApiErrorMessage(deleteRegionMutation.error)}
                title="회사 지역 삭제 실패"
                variant="inline"
              />
            ) : null}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
