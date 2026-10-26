import { useAppI18n } from "@/features/app-i18n";

// 기능 : 업무목록의 공통 헤더가 연결되는 화면 영역을 제공합니다.
export function WorkspaceListPage() {
  const { t } = useAppI18n();
  return <section aria-label={t("navigation.workListsGroup")} className="min-h-0 flex-1" data-testid="workspace-list-page" />;
}
