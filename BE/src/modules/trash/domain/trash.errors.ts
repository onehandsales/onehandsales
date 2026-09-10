import { DomainError } from "@/shared/domain/errors/domain-error";

export class TrashTargetTypeUnsupportedError extends DomainError {
  constructor() {
    super("TRASH_TARGET_TYPE_UNSUPPORTED", "Unsupported trash target type", {
      field: "targetType",
    });
  }
}

export class TrashRecordNotFoundError extends DomainError {
  constructor() {
    super("TRASH_RECORD_NOT_FOUND", "Trash record was not found", {
      field: "targetId",
    });
  }
}
