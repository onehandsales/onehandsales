import type { AdminDomainType } from "@/features/admin-query/types/admin-query";

export const domainLabels: Record<AdminDomainType, string> = {
  companies: "회사",
  contacts: "거래처",
  products: "제품",
  deals: "딜",
};

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "요청을 처리하지 못했습니다.";
}
