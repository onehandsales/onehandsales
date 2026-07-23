export const GOOGLE_CALENDAR_READ_PROVIDER = Symbol(
  "GOOGLE_CALENDAR_READ_PROVIDER"
);

export class GoogleCalendarProviderAuthError extends Error {
  constructor(readonly safeCode = "GOOGLE_AUTH_FAILED") {
    super("Google Calendar provider authorization failed");
  }
}

export class GoogleCalendarProviderSyncTokenExpiredError extends Error {
  constructor() {
    super("Google Calendar sync token expired");
  }
}

export class GoogleCalendarProviderTransientError extends Error {
  constructor(readonly safeCode = "GOOGLE_PROVIDER_UNAVAILABLE") {
    super("Google Calendar provider transient failure");
  }
}

export interface GoogleCalendarProviderRefreshResult {
  readonly accessToken: string;
  readonly expiresInSeconds: number | null;
  readonly grantedScopes: readonly string[];
}

export interface GoogleCalendarProviderCalendar {
  readonly calendarId: string;
  readonly calendarName: string;
  readonly calendarTimeZone: string | null;
  readonly isPrimary: boolean;
}

export interface GoogleCalendarProviderCalendarListPage {
  readonly items: readonly GoogleCalendarProviderCalendar[];
  readonly nextPageToken: string | null;
}

export interface ListGoogleCalendarListPageInput {
  readonly accessToken: string;
  readonly pageToken?: string;
}

export interface GoogleCalendarProviderEventDateTime {
  readonly dateTime?: string;
  readonly date?: string;
  readonly timeZone?: string;
}

export interface GoogleCalendarProviderEvent {
  readonly id: string;
  readonly status: string | null;
  readonly summary: string | null;
  readonly start: GoogleCalendarProviderEventDateTime | null;
  readonly end: GoogleCalendarProviderEventDateTime | null;
  readonly location: string | null;
  readonly description: string | null;
  readonly hangoutLink: string | null;
  readonly conferenceData: {
    readonly entryPoints: readonly {
      readonly entryPointType: string | null;
      readonly uri: string | null;
    }[];
  } | null;
  readonly htmlLink: string | null;
  readonly iCalUID: string | null;
  readonly etag: string | null;
  readonly updated: string | null;
}

export interface GoogleCalendarProviderEventListPage {
  readonly items: readonly GoogleCalendarProviderEvent[];
  readonly nextPageToken: string | null;
  readonly nextSyncToken: string | null;
}

export interface ListGoogleCalendarEventsPageInput {
  readonly accessToken: string;
  readonly calendarId: string;
  readonly syncToken?: string;
  readonly timeMin?: Date;
  readonly timeMax?: Date;
  readonly timeZone: string;
  readonly pageToken?: string;
}

export interface GoogleCalendarReadProvider {
  refreshAccessToken(
    refreshToken: string
  ): Promise<GoogleCalendarProviderRefreshResult>;
  listCalendarListPage(
    input: ListGoogleCalendarListPageInput
  ): Promise<GoogleCalendarProviderCalendarListPage>;
  listEventsPage(
    input: ListGoogleCalendarEventsPageInput
  ): Promise<GoogleCalendarProviderEventListPage>;
}
