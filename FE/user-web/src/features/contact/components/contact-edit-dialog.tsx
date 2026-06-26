import { Save } from "lucide-react";
import { useState } from "react";
import { ModalFooterActions } from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { ContactEditForm } from "@/features/contact/components/contact-edit-form";
import type { ContactDetail } from "@/features/contact/types/contact";

type ContactEditDialogProps = {
  readonly open: boolean;
  readonly contact: ContactDetail;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSaved: () => void;
};

// 기능 : 담당자 수정 form을 생성 모달과 같은 overlay 안에서 표시합니다.
export function ContactEditDialog({
  open,
  contact,
  onOpenChange,
  onSaved,
}: ContactEditDialogProps) {
  const formId = "contact-edit-form";
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
      panelClassName="max-h-[calc(100vh-2rem)] md:max-h-[720px]"
      size="md"
      title="담당자 수정"
      onOpenChange={onOpenChange}
    >
      <ContactEditForm
        contact={contact}
        formId={formId}
        onPendingChange={setIsSubmitting}
        onSaved={() => {
          onSaved();
          onOpenChange(false);
        }}
      />
    </ModalShell>
  );
}
