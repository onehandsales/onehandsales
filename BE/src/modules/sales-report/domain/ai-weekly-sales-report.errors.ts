import { DomainError } from "@/shared/domain/errors/domain-error";

export class AiWeeklySalesReportAlreadyGeneratingError extends DomainError {
  constructor(message = "AI weekly sales report is already generating") {
    super("AiWeeklySalesReportAlreadyGenerating", message);
  }
}

export class AiWeeklySalesReportNotFoundError extends DomainError {
  constructor(message = "AI weekly sales report was not found") {
    super("AiWeeklySalesReportNotFound", message);
  }
}

export class AiWeeklySalesReportProviderUnavailableError extends DomainError {
  constructor(message = "AI weekly sales report provider is unavailable") {
    super("AiWeeklySalesReportProviderUnavailable", message);
  }
}

export class AiWeeklySalesReportProviderFailedError extends DomainError {
  constructor(message = "AI weekly sales report generation failed") {
    super("AiWeeklySalesReportProviderFailed", message);
  }
}
