import { Save } from "lucide-react";
import { useState } from "react";
import { ModalFooterActions } from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { CompanyEditForm } from "@/features/company/components/company-edit-form";
import type {
  CompanyDetail,
  CompanyField,
  CompanyRegion,
} from "@/features/company/types/company";

type CompanyEditDialogProps = {
  readonly open: boolean;
  readonly company: CompanyDetail;
  readonly fields: CompanyField[];
  readonly regions: CompanyRegion[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onSaved: () => void;
};

// 기능 : 회사 수정 form을 생성 모달과 같은 overlay 안에서 표시합니다.
export function CompanyEditDialog({
  open,
  company,
  fields,
  regions,
  onOpenChange,
  onSaved,
}: CompanyEditDialogProps) {
  const formId = "company-edit-form";
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ModalShell
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={isSubmitting}
          pendingLabel="저장 중"
          submitIcon={<Save className="h-4 w-4" />}
          submitLabel="저장"
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      bodyClassName="py-4"
      footerClassName="h-14"
      panelClassName="max-h-[calc(100vh-2rem)] md:max-h-[680px]"
      size="md"
      title="회사 수정"
      onOpenChange={onOpenChange}
    >
      <CompanyEditForm
        company={company}
        fields={fields}
        formId={formId}
        regions={regions}
        onPendingChange={setIsSubmitting}
        onSaved={() => {
          onSaved();
          onOpenChange(false);
        }}
      />
    </ModalShell>
  );
}
