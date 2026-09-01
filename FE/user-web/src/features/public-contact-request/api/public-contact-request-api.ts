import type {
  CreatePublicContactRequestInput,
  CreatePublicContactRequestResponse,
} from "@/features/public-contact-request/types/public-contact-request";
import { apiClient } from "@/lib/api-client";

// 기능 : 로그인 전 공개 문의 접수 요청을 JSON body로 전송합니다.
export function createPublicContactRequest(
  input: CreatePublicContactRequestInput
) {
  return apiClient<CreatePublicContactRequestResponse>(
    "/api/public/contact-requests",
    {
      method: "POST",
      skipAuthRefresh: true,
      body: {
        email: input.email,
        companySize: input.companySize,
        firstName: input.firstName,
        lastName: input.lastName,
        company: input.company,
        title: input.title,
        region: input.region,
        phone: input.phone,
        plan: input.plan,
        source: input.source,
        marketingAgreement: input.marketingAgreement,
        pageUrl: input.pageUrl,
        locale: input.locale,
      },
    }
  );
}
