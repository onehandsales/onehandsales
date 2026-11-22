export const projectTabs = ["Overview", "Invoices", "Tasks", "Time Tracking", "Team", "Settings"] as const;
export type ProjectTab = typeof projectTabs[number];
