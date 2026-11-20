import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";

// 기능 : 업무 플로우를 구현하지 않고 Bonsai 공통 요소의 원본 문구·치수를 독립 비교한다.
export function ComponentsPage() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return <div className="page-content component-preview">
    <p className="eyebrow">G01 · Component specimens</p><h1>Interface components</h1>
    <p className="intro">Reference elements only. The complete client flow belongs to G19.</p>
    <section className="component-sample" aria-label="Field and button reference">
      <Field label="Company Name" placeholder="Smith Co." value={value} onChange={(event) => setValue(event.currentTarget.value)} />
      <Button onClick={() => setOpen(true)}>Add Client</Button>
    </section>
    <p className="reference-note">Client dialog · step 03 · 1440 × 900 comparison</p>
    {open && <Dialog title="New Client" description="Simply adding a client will not notify them in any way." onClose={() => setOpen(false)}
      footer={<Button onClick={() => setOpen(false)}>Add Client</Button>}>
      <Field label="Company Name" placeholder="Smith Co." value={value} onChange={(event) => setValue(event.currentTarget.value)} />
    </Dialog>}
  </div>;
}
