import { describe, expect, it } from "vitest";
import type { BusinessCardConfirmFormValues } from "@/features/business-card/schemas/business-card-schema";
import type { MeetingNoteCreateFormValues } from "@/features/meeting-note/schemas/meeting-note-schema";
import {
  toBusinessCardConfirmLocalDraftPayload,
  toMeetingNoteCreateLocalDraftPayload,
} from "./mobile-local-draft-payload";

describe("mobile local draft payload helpers", () => {
  it("keeps business card draft payload to confirm form text fields only", () => {
    const values = {
      companyName: "원핸드",
      companyFieldName: "SaaS",
      companyRegionName: "서울",
      contactName: "홍길동",
      contactMobile: "010-1111-2222",
      contactEmail: "sales@example.com",
      contactDepartmentName: "영업",
      contactJobGradeName: "매니저",
      imageBase64: "forbidden",
      ocrText: "forbidden",
      providerResponse: "forbidden",
    } as BusinessCardConfirmFormValues & Record<string, unknown>;

    const payload = toBusinessCardConfirmLocalDraftPayload("scan-001", values);

    expect(payload).toEqual({
      scanLogId: "scan-001",
      companyName: "원핸드",
      companyFieldName: "SaaS",
      companyRegionName: "서울",
      contactName: "홍길동",
      contactMobile: "010-1111-2222",
      contactEmail: "sales@example.com",
      contactDepartmentName: "영업",
      contactJobGradeName: "매니저",
    });
    expect(Object.keys(payload)).not.toContain("imageBase64");
    expect(Object.keys(payload)).not.toContain("ocrText");
    expect(Object.keys(payload)).not.toContain("providerResponse");
  });

  it("keeps meeting note draft payload without audio, transcript, or provider raw fields", () => {
    const values = {
      title: "현장 상담",
      meetingLocalDateTime: "2026-07-31T10:00",
      companyIds: ["company-001"],
      contactIds: ["contact-001"],
      productIds: ["product-001"],
      dealIds: ["deal-001"],
      details: "회의 내용",
      nextPlan: "다음 계획",
      requiredAction: "필요 행동",
      audioBase64: "forbidden",
      transcript: "forbidden",
      providerResponse: "forbidden",
      prompt: "forbidden",
    } as MeetingNoteCreateFormValues & Record<string, unknown>;

    const payload = toMeetingNoteCreateLocalDraftPayload("client-001", values);

    expect(payload).toEqual({
      clientDraftId: "client-001",
      meetingLocalDateTime: "2026-07-31T10:00",
      companyIds: ["company-001"],
      contactIds: ["contact-001"],
      productIds: ["product-001"],
      dealIds: ["deal-001"],
      title: "현장 상담",
      details: "회의 내용",
      nextPlan: "다음 계획",
      requiredAction: "필요 행동",
    });
    expect(Object.keys(payload)).not.toContain("audioBase64");
    expect(Object.keys(payload)).not.toContain("transcript");
    expect(Object.keys(payload)).not.toContain("providerResponse");
    expect(Object.keys(payload)).not.toContain("prompt");
  });
});
