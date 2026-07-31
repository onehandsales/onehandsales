import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api-client";
import { createMeetingNoteSttAiDraft } from "./meeting-note-api";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

describe("createMeetingNoteSttAiDraft", () => {
  beforeEach(() => {
    apiClientMock.mockReset();
    apiClientMock.mockResolvedValue({
      details: "초안",
      nextPlan: null,
      requiredAction: null,
      sourceType: "STT_AI",
      transcript: "녹취",
    });
  });

  it("sends audio and selected context as multipart FormData", async () => {
    const audioFile = new File([new Blob(["audio"])], "meeting.webm", {
      type: "audio/webm",
    });

    await createMeetingNoteSttAiDraft({
      audioFile,
      companies: ["company-1"],
      contacts: ["contact-1"],
      deals: ["deal-1"],
      meetingLocalDateTime: "2026-07-31T10:30",
      products: ["product-1"],
    });

    expect(apiClientMock).toHaveBeenCalledWith("/api/meeting-notes/stt-draft", {
      body: expect.any(FormData),
      method: "POST",
    });

    const [, options] = apiClientMock.mock.calls[0] ?? [];
    const body = isFormDataOptions(options) ? options.body : null;

    expect(body?.get("audio")).toBe(audioFile);
    expect(body?.get("meetingLocalDateTime")).toBe("2026-07-31T10:30");
    expect(body?.getAll("companies")).toEqual(["company-1"]);
    expect(body?.getAll("contacts")).toEqual(["contact-1"]);
    expect(body?.getAll("products")).toEqual(["product-1"]);
    expect(body?.getAll("deals")).toEqual(["deal-1"]);
  });
});

// 기능 : apiClient options에서 multipart body만 안전하게 좁힙니다.
function isFormDataOptions(
  value: unknown
): value is { readonly body: FormData } {
  return (
    typeof value === "object" &&
    value !== null &&
    "body" in value &&
    value.body instanceof FormData
  );
}
