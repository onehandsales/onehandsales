import { ConfigService } from "@nestjs/config";
import {
  GoogleCalendarProviderAuthError,
  GoogleCalendarProviderSyncTokenExpiredError,
} from "@/modules/schedule/application/ports/google-calendar-read.provider";
import { GoogleCalendarReadProviderAdapter } from "./google-calendar-read.provider";

function createProvider() {
  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        GOOGLE_CALENDAR_CLIENT_ID: "client-id",
        GOOGLE_CALENDAR_CLIENT_SECRET: "client-secret",
      };

      return values[key];
    }),
  } as unknown as ConfigService;

  return new GoogleCalendarReadProviderAdapter(configService);
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("GoogleCalendarReadProviderAdapter", () => {
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it("lists calendars with CalendarList.list parameters and maps provider rows", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        nextPageToken: "next-page",
        items: [
          {
            id: "primary",
            summary: "sales@example.com",
            timeZone: "Asia/Seoul",
            primary: true,
          },
          {
            id: "team",
            summary: "Team",
            summaryOverride: "Sales team",
          },
        ],
      })
    );

    const result = await provider.listCalendarListPage({
      accessToken: "access-token",
      pageToken: "page-1",
    });
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(url.pathname).toBe("/calendar/v3/users/me/calendarList");
    expect(url.searchParams.get("maxResults")).toBe("250");
    expect(url.searchParams.get("showDeleted")).toBe("false");
    expect(url.searchParams.get("showHidden")).toBe("true");
    expect(url.searchParams.get("pageToken")).toBe("page-1");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: {
        authorization: "Bearer access-token",
      },
    });
    expect(result).toEqual({
      nextPageToken: "next-page",
      items: [
        {
          calendarId: "primary",
          calendarName: "sales@example.com",
          calendarTimeZone: "Asia/Seoul",
          isPrimary: true,
        },
        {
          calendarId: "team",
          calendarName: "Sales team",
          calendarTimeZone: null,
          isPrimary: false,
        },
      ],
    });
  });

  it("separates full and incremental Events.list parameters", async () => {
    const provider = createProvider();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { items: [], nextSyncToken: "s1" }))
      .mockResolvedValueOnce(jsonResponse(200, { items: [], nextSyncToken: "s2" }));

    await provider.listEventsPage({
      accessToken: "access-token",
      calendarId: "primary",
      timeMin: new Date("2026-06-22T00:00:00.000Z"),
      timeMax: new Date("2026-10-22T00:00:00.000Z"),
      timeZone: "Asia/Seoul",
    });
    await provider.listEventsPage({
      accessToken: "access-token",
      calendarId: "primary",
      syncToken: "sync-token",
      timeZone: "Asia/Seoul",
    });

    const fullUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    const incrementalUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));

    expect(fullUrl.searchParams.get("singleEvents")).toBe("true");
    expect(fullUrl.searchParams.get("showDeleted")).toBe("true");
    expect(fullUrl.searchParams.get("orderBy")).toBe("startTime");
    expect(fullUrl.searchParams.get("timeMin")).toBe(
      "2026-06-22T00:00:00.000Z"
    );
    expect(fullUrl.searchParams.get("timeMax")).toBe(
      "2026-10-22T00:00:00.000Z"
    );
    expect(fullUrl.searchParams.has("syncToken")).toBe(false);

    expect(incrementalUrl.searchParams.get("syncToken")).toBe("sync-token");
    expect(incrementalUrl.searchParams.get("singleEvents")).toBe("true");
    expect(incrementalUrl.searchParams.get("showDeleted")).toBe("true");
    expect(incrementalUrl.searchParams.has("timeMin")).toBe(false);
    expect(incrementalUrl.searchParams.has("timeMax")).toBe(false);
    expect(incrementalUrl.searchParams.has("orderBy")).toBe(false);
  });

  it("maps provider auth and expired sync token responses", async () => {
    const provider = createProvider();
    fetchMock.mockResolvedValueOnce(jsonResponse(410, {}));

    await expect(
      provider.listEventsPage({
        accessToken: "access-token",
        calendarId: "primary",
        syncToken: "expired",
        timeZone: "Asia/Seoul",
      })
    ).rejects.toBeInstanceOf(GoogleCalendarProviderSyncTokenExpiredError);

    fetchMock.mockResolvedValueOnce(jsonResponse(400, { error: "invalid_grant" }));

    await expect(provider.refreshAccessToken("refresh-token")).rejects.toBeInstanceOf(
      GoogleCalendarProviderAuthError
    );
  });
});
