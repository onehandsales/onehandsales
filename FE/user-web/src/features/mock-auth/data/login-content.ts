// 의미 : 제공 로그인 PNG의 보이는 Changelog 발췌이며 현재 제품 업데이트가 아니다.
type HistoricalUpdate = { title: string; body: string; badge?: string };
export const loginUpdates: readonly HistoricalUpdate[] = [
  { title: "Create custom task statuses.", body: "Build your ideal task workflow with your own custom statuses that show up on the task board and..." },
  { title: "Week view of time tracked.", body: "Better understand where time is spent every day with the weekly view, and optimize based on..." },
  { title: "New brand setting: Custom fonts.", body: "Further customize all of your client documents and touch points by setting your font in your brand..." },
  { title: "New invoice settings.", body: "Choose your invoice layout Keep your invoices simple with the new Studio Layout, or add a bit..." },
  { title: "New tasks in projects.", body: "Better manage tasks in projects Get more visibility and control over your project tasks in the..." },
  { title: "New board view.", body: "Switch between the list view and board view to see how your tasks are progressing!" },
];

// 의미 : 재설정10 원본의 다른 Changelog 버전을 해당 완료 화면에서만 재현하는 과거 발췌다.
export const resetUpdates: readonly HistoricalUpdate[] = [
  { badge: "Improvement", title: "New Collaborators project view", body: "When viewing a project, collaborators now land directly in their project’s tasks. This keeps..." },
  { title: "Categorize your tasks with tags.", body: "Better organize tasks across projects and clients with custom tags. Filter your list and board..." },
  { title: "Prioritize your tasks.", body: "Make it easier to understand what your team should work on next by prioritizing tasks as Urgent,..." },
  { title: "New Project Manager role.", body: "Empower your team to manage clients and projects while keeping invoicing and financial data..." },
  ...loginUpdates.slice(0,2),
];
