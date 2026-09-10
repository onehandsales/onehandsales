import { describe, expect, it } from "vitest";
import type { MeetingNoteCreateFormValues } from "@/features/meeting-note";
import { toMeetingNoteCreateLocalDraftPayload } from "./mobile-local-draft-payload";

describe("mobile local draft payload helpers", () => {
  it("keeps meeting note draft payload without audio, transcript, or provider raw fields", () => {
    const values = {
      title: "Field meeting",
      meetingLocalDateTime: "2026-07-31T10:00",
      companyIds: ["company-001"],
      contactIds: ["contact-001"],
      productIds: ["product-001"],
      dealIds: ["deal-001"],
      details: "Meeting details",
      nextPlan: "Next plan",
      requiredAction: "Required action",
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
      title: "Field meeting",
      details: "Meeting details",
      nextPlan: "Next plan",
      requiredAction: "Required action",
    });
    expect(Object.keys(payload)).not.toContain("audioBase64");
    expect(Object.keys(payload)).not.toContain("transcript");
    expect(Object.keys(payload)).not.toContain("providerResponse");
    expect(Object.keys(payload)).not.toContain("prompt");
  });
});
