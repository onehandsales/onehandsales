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
  return (
    <ModalShell
      open={open}
      panelClassName="max-h-[82vh] md:max-h-[620px]"
      size="md"
      title="회사 수정"
      onOpenChange={onOpenChange}
    >
      <CompanyEditForm
        company={company}
        fields={fields}
        regions={regions}
        onSaved={() => {
          onSaved();
          onOpenChange(false);
        }}
      />
    </ModalShell>
  );
}
