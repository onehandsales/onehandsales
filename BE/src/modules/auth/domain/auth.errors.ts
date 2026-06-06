import { DomainError } from "@/shared/domain/errors/domain-error";

export class ExternalUserEmailMissingError extends DomainError {
  constructor() {
    super("ExternalUserEmailMissing", "External auth user email is missing");
  }
}

export class InvalidDeviceSlotError extends DomainError {
  constructor() {
    super("InvalidDeviceSlot", "Device slot is invalid");
  }
}

export class InvalidDeviceIdError extends DomainError {
  constructor() {
    super("InvalidDeviceId", "Device id is invalid");
  }
}

export class DeviceSlotAlreadyRegisteredError extends DomainError {
  constructor() {
    super(
      "DeviceSlotAlreadyRegistered",
      "Another active device is already registered in this slot"
    );
  }
}

export class InactiveUserError extends DomainError {
  constructor() {
    super("InactiveUser", "User is not active");
  }
}

export class OAuthAccountConflictError extends DomainError {
  constructor() {
    super("OAuthAccountConflict", "OAuth account is already linked");
  }
}

export class InvalidRefreshOriginError extends DomainError {
  constructor() {
    super("InvalidRefreshOrigin", "Refresh origin is not allowed");
  }
}

