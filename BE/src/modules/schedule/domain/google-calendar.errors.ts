import { DomainError } from "@/shared/domain/errors/domain-error";

export class GoogleCalendarConnectionNotFoundError extends DomainError {
  constructor() {
    super(
      "GoogleCalendarConnectionNotFound",
      "Google Calendar connection was not found"
    );
  }
}

export class GoogleCalendarReconnectRequiredError extends DomainError {
  constructor() {
    super(
      "GoogleCalendarReconnectRequired",
      "Google Calendar reconnection is required"
    );
  }
}

export class GoogleCalendarOAuthStateInvalidError extends DomainError {
  constructor() {
    super(
      "GoogleCalendarOAuthStateInvalid",
      "Google Calendar OAuth state is invalid or expired"
    );
  }
}

export class GoogleCalendarTokenEncryptionKeyMissingError extends DomainError {
  constructor() {
    super(
      "GoogleCalendarTokenEncryptionKeyMissing",
      "Google Calendar token encryption key is missing"
    );
  }
}

export class GoogleCalendarSourceSelectionRequiredError extends DomainError {
  constructor() {
    super(
      "GoogleCalendarSourceSelectionRequired",
      "Google Calendar source selection is required"
    );
  }
}

export class GoogleCalendarSyncInProgressError extends DomainError {
  constructor() {
    super(
      "GoogleCalendarSyncInProgress",
      "Google Calendar sync is already in progress"
    );
  }
}

export class GoogleCalendarProviderUnavailableError extends DomainError {
  constructor(message = "Google Calendar provider is unavailable") {
    super("GoogleCalendarProviderUnavailable", message);
  }
}
