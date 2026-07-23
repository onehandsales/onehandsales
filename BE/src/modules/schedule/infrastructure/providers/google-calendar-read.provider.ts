import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  GoogleCalendarProviderAuthError,
  type GoogleCalendarProviderCalendar,
  type GoogleCalendarProviderCalendarListPage,
  type GoogleCalendarProviderEvent,
  type GoogleCalendarProviderEventDateTime,
  type GoogleCalendarProviderEventListPage,
  GoogleCalendarProviderSyncTokenExpiredError,
  GoogleCalendarProviderTransientError,
  type GoogleCalendarReadProvider,
  type ListGoogleCalendarEventsPageInput,
  type ListGoogleCalendarListPageInput,
} from "@/modules/schedule/application/ports/google-calendar-read.provider";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3";
const CALENDAR_LIST_MAX_RESULTS = "250";
const EVENTS_MAX_RESULTS = "2500";

@Injectable()
export class GoogleCalendarReadProviderAdapter
  implements GoogleCalendarReadProvider
{
  constructor(private readonly configService: ConfigService) {}

  async refreshAccessToken(refreshToken: string) {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.getRequiredConfig("GOOGLE_CALENDAR_CLIENT_ID"),
        client_secret: this.getRequiredConfig("GOOGLE_CALENDAR_CLIENT_SECRET"),
        grant_type: "refresh_token",
      }),
    });

    if (
      response.status === 400 ||
      response.status === 401 ||
      response.status === 403
    ) {
      throw new GoogleCalendarProviderAuthError("GOOGLE_REFRESH_AUTH_FAILED");
    }

    if (!response.ok) {
      throw new GoogleCalendarProviderTransientError(
        "GOOGLE_REFRESH_UNAVAILABLE"
      );
    }

    const body = await this.readJsonRecord(response);
    const accessToken = this.readString(body, "access_token");

    if (!accessToken) {
      throw new GoogleCalendarProviderTransientError(
        "GOOGLE_REFRESH_RESPONSE_INVALID"
      );
    }

    return {
      accessToken,
      expiresInSeconds: this.readNumber(body, "expires_in"),
      grantedScopes: this.readScopes(body),
    };
  }

  async listCalendarListPage(
    input: ListGoogleCalendarListPageInput
  ): Promise<GoogleCalendarProviderCalendarListPage> {
    const url = new URL(`${GOOGLE_CALENDAR_API_URL}/users/me/calendarList`);
    url.searchParams.set("maxResults", CALENDAR_LIST_MAX_RESULTS);
    url.searchParams.set("showDeleted", "false");
    url.searchParams.set("showHidden", "true");

    if (input.pageToken) {
      url.searchParams.set("pageToken", input.pageToken);
    }

    const body = await this.getGoogleJson({
      accessToken: input.accessToken,
      url,
      authSafeCode: "GOOGLE_CALENDAR_LIST_AUTH_FAILED",
      transientSafeCode: "GOOGLE_CALENDAR_LIST_UNAVAILABLE",
    });

    return {
      items: this.readRecordArray(body, "items")
        .map((item) => this.mapCalendar(item))
        .filter(
          (calendar): calendar is GoogleCalendarProviderCalendar =>
            calendar !== null
        ),
      nextPageToken: this.readString(body, "nextPageToken"),
    };
  }

  async listEventsPage(
    input: ListGoogleCalendarEventsPageInput
  ): Promise<GoogleCalendarProviderEventListPage> {
    const url = new URL(
      `${GOOGLE_CALENDAR_API_URL}/calendars/${encodeURIComponent(
        input.calendarId
      )}/events`
    );
    url.searchParams.set("maxResults", EVENTS_MAX_RESULTS);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("showDeleted", "true");
    url.searchParams.set("timeZone", input.timeZone);

    if (input.pageToken) {
      url.searchParams.set("pageToken", input.pageToken);
    }

    if (input.syncToken) {
      url.searchParams.set("syncToken", input.syncToken);
    } else {
      if (!input.timeMin || !input.timeMax) {
        throw new GoogleCalendarProviderTransientError(
          "GOOGLE_CALENDAR_EVENTS_RANGE_REQUIRED"
        );
      }

      url.searchParams.set("timeMin", input.timeMin.toISOString());
      url.searchParams.set("timeMax", input.timeMax.toISOString());
      url.searchParams.set("orderBy", "startTime");
    }

    const body = await this.getGoogleJson({
      accessToken: input.accessToken,
      url,
      authSafeCode: "GOOGLE_CALENDAR_EVENTS_AUTH_FAILED",
      transientSafeCode: "GOOGLE_CALENDAR_EVENTS_UNAVAILABLE",
      syncTokenAware: true,
    });

    return {
      items: this.readRecordArray(body, "items")
        .map((item) => this.mapEvent(item))
        .filter((event): event is GoogleCalendarProviderEvent => event !== null),
      nextPageToken: this.readString(body, "nextPageToken"),
      nextSyncToken: this.readString(body, "nextSyncToken"),
    };
  }

  private async getGoogleJson(input: {
    readonly accessToken: string;
    readonly url: URL;
    readonly authSafeCode: string;
    readonly transientSafeCode: string;
    readonly syncTokenAware?: boolean;
  }): Promise<Record<string, unknown>> {
    const response = await fetch(input.url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${input.accessToken}`,
      },
    });

    if (input.syncTokenAware && response.status === 410) {
      throw new GoogleCalendarProviderSyncTokenExpiredError();
    }

    if (response.status === 401 || response.status === 403) {
      throw new GoogleCalendarProviderAuthError(input.authSafeCode);
    }

    if (!response.ok) {
      throw new GoogleCalendarProviderTransientError(input.transientSafeCode);
    }

    return this.readJsonRecord(response);
  }

  private async readJsonRecord(
    response: Response
  ): Promise<Record<string, unknown>> {
    try {
      const value = (await response.json()) as unknown;

      if (this.isRecord(value)) {
        return value;
      }
    } catch {
      throw new GoogleCalendarProviderTransientError(
        "GOOGLE_RESPONSE_PARSE_FAILED"
      );
    }

    throw new GoogleCalendarProviderTransientError(
      "GOOGLE_RESPONSE_PARSE_FAILED"
    );
  }

  private mapCalendar(
    calendar: Record<string, unknown>
  ): GoogleCalendarProviderCalendar | null {
    const calendarId = this.readString(calendar, "id");

    if (!calendarId) {
      return null;
    }

    const summaryOverride = this.readString(calendar, "summaryOverride");
    const summary = this.readString(calendar, "summary");

    return {
      calendarId,
      calendarName: summaryOverride ?? summary ?? calendarId,
      calendarTimeZone: this.readString(calendar, "timeZone"),
      isPrimary: this.readBoolean(calendar, "primary") === true,
    };
  }

  private mapEvent(
    event: Record<string, unknown>
  ): GoogleCalendarProviderEvent | null {
    const id = this.readString(event, "id");

    if (!id) {
      return null;
    }

    return {
      id,
      status: this.readString(event, "status"),
      summary: this.readString(event, "summary"),
      start: this.readEventDateTime(event, "start"),
      end: this.readEventDateTime(event, "end"),
      location: this.readString(event, "location"),
      description: this.readString(event, "description"),
      hangoutLink: this.readString(event, "hangoutLink"),
      conferenceData: this.readConferenceData(event),
      htmlLink: this.readString(event, "htmlLink"),
      iCalUID: this.readString(event, "iCalUID"),
      etag: this.readString(event, "etag"),
      updated: this.readString(event, "updated"),
    };
  }

  private readEventDateTime(
    event: Record<string, unknown>,
    key: string
  ): GoogleCalendarProviderEventDateTime | null {
    const value = event[key];

    if (!this.isRecord(value)) {
      return null;
    }

    const dateTime = this.readString(value, "dateTime");
    const date = this.readString(value, "date");
    const timeZone = this.readString(value, "timeZone");

    return {
      ...(dateTime ? { dateTime } : {}),
      ...(date ? { date } : {}),
      ...(timeZone ? { timeZone } : {}),
    };
  }

  private readConferenceData(event: Record<string, unknown>) {
    const conferenceData = event.conferenceData;

    if (!this.isRecord(conferenceData)) {
      return null;
    }

    return {
      entryPoints: this.readRecordArray(conferenceData, "entryPoints").map(
        (entryPoint) => ({
          entryPointType: this.readString(entryPoint, "entryPointType"),
          uri: this.readString(entryPoint, "uri"),
        })
      ),
    };
  }

  private readRecordArray(
    record: Record<string, unknown>,
    key: string
  ): Record<string, unknown>[] {
    const value = record[key];

    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is Record<string, unknown> =>
      this.isRecord(item)
    );
  }

  private readScopes(record: Record<string, unknown>): string[] {
    const scope = this.readString(record, "scope");

    return scope ? scope.split(" ").filter((value) => value.length > 0) : [];
  }

  private readString(
    record: Record<string, unknown>,
    key: string
  ): string | null {
    const value = record[key];

    if (typeof value !== "string") {
      return null;
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }

  private readNumber(
    record: Record<string, unknown>,
    key: string
  ): number | null {
    const value = record[key];

    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  private readBoolean(
    record: Record<string, unknown>,
    key: string
  ): boolean | null {
    const value = record[key];

    return typeof value === "boolean" ? value : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value || value.trim().length === 0) {
      throw new GoogleCalendarProviderTransientError(`${key}_MISSING`);
    }

    return value;
  }
}
