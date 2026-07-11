import { useNavigate } from "react-router-dom";
import { ContactListScreen } from "@/features/contact";

export function ContactNewPage() {
  const navigate = useNavigate();

  return (
    <ContactListScreen
      initialCreateOpen
      onCreateDialogClose={() => {
        void navigate("/app/contacts", { replace: true });
      }}
    />
  );
}
