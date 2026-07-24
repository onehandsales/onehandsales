import { z } from "zod";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const createAiWeeklyReportSchema = z.object({
  weekStart: z.string().regex(DATE_ONLY_PATTERN),
  timeZone: z.string().trim().min(1).optional(),
  locale: z.string().trim().min(2).optional(),
});

export type CreateAiWeeklyReportFormValues = z.infer<
  typeof createAiWeeklyReportSchema
>;
