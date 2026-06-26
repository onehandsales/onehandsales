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
  return (
    <ModalShell
      open={open}
      panelClassName="max-h-[84vh] md:max-h-[680px]"
      size="md"
      title="담당자 수정"
      onOpenChange={onOpenChange}
    >
      <ContactEditForm
        contact={contact}
        onSaved={() => {
          onSaved();
          onOpenChange(false);
        }}
      />
    </ModalShell>
  );
}
