import { useAppI18n } from "@/features/app-i18n";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useOutletContext } from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { ViewHeaderToolbar } from "@/components/layout/view-header-toolbar";

// 기능 : 업무목록의 공통 헤더가 연결되는 화면 영역을 제공합니다.
export function WorkspaceListPage() {
  const { t } = useAppI18n();
  const { headerToolbarElement, viewHeaderModel, viewMenus } = useOutletContext<AppShellOutletContext>();
  const [search, setSearch] = useState("");
  useEffect(() => {
    // 1. 대상·보기 전환 시 이전 검색 미리보기를 초기화한다.
    setSearch("");
  }, [viewMenus.scope]);
  const toolbar = <ViewHeaderToolbar header={viewHeaderModel} menus={viewMenus} searchLabel={t("common.search")} searchValue={search} onSearchChange={setSearch} />;
  return <section aria-label={t("navigation.workListsGroup")} className="min-h-0 flex-1" data-testid="workspace-list-page">
    {headerToolbarElement ? createPortal(toolbar, headerToolbarElement) : <div className="flex h-[var(--topbar-height)] items-center gap-2 bg-white px-3 lg:hidden">{toolbar}</div>}
  </section>;
}
