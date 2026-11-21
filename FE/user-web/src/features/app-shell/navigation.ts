import { LayoutGrid, Users, Folder, SquareCheck, MailOpen, Send, FileText, Clock3, BriefcaseBusiness, FilePenLine, CalendarDays, ChartNoAxesCombined, UserPlus, Gift } from "lucide-react";

// 의미 : 원본의 메뉴 순서·이름과 이번 범위의 로컬 목적지를 연결하며 업무 구현 완료를 뜻하지 않는다.
export const appNavigation = [
  { label: "", items: [{ name: "Dashboard", path: "/app", Icon: LayoutGrid }, { name: "Clients", path: "/app/pending/clients", Icon: Users }, { name: "Projects", path: "/app/pending/projects", Icon: Folder }, { name: "Tasks", path: "/app/pending/tasks", Icon: SquareCheck }] },
  { label: "Tools", items: [{ name: "Invoices", path: "/app/pending/invoices", Icon: MailOpen }, { name: "Proposals", path: "/app/pending/proposals", Icon: Send }, { name: "Contracts", path: "/app/pending/contracts", Icon: FileText }, { name: "Time Tracking", path: "/app/pending/time-tracking", Icon: Clock3 }, { name: "Services", path: "/app/pending/services", Icon: BriefcaseBusiness }, { name: "Forms", path: "/app/pending/forms", Icon: FilePenLine }, { name: "Scheduling", path: "/app/pending/scheduling", Icon: CalendarDays }] },
  { label: "Finances", items: [{ name: "Bookkeeping", path: "/app/pending/bookkeeping", Icon: ChartNoAxesCombined }] },
];
export const appSidebarActions = [{ name: "Invite Team", path: "/app/settings/team?invite=1", Icon: UserPlus }, { name: "Get 1 Month Free", path: "/app/pending/referral", Icon: Gift }];
