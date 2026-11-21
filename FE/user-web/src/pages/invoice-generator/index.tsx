import { CommercialAudiences } from "@/features/public-commercial";
import { InvoiceGenerator } from "@/features/public-invoice";
import "@/styles/invoice-generator.css";

// 기능 : G06 공개 청구서 안내에서 이어지는 독립 생성기와 공통 고객군 탐색을 조립한다.
export function InvoiceGeneratorPage() { return <><CommercialAudiences /><InvoiceGenerator /></>; }
