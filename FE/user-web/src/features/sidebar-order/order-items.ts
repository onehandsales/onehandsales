// 기능 : 지정한 ID 순서를 적용하되 이후 추가된 항목도 잃지 않게 유지합니다.
export function orderItems<T extends { readonly id: string }>(items: readonly T[], ids: readonly string[]): T[] {
  const byId = new Map(items.map(item => [item.id, item]));
  const ordered = ids.flatMap(id => {
    const item = byId.get(id);
    if (!item) return [];
    byId.delete(id);
    return [item];
  });
  return [...ordered, ...byId.values()];
}

// 기능 : 같은 섹션에서 하나의 항목을 기준 항목 앞/뒤로 이동합니다.
export function moveSidebarItem(ids: readonly string[], source: string, target: string, side: "before" | "after"): string[] {
  if (source === target || !ids.includes(source) || !ids.includes(target)) return [...ids];
  const next = ids.filter(id => id !== source);
  next.splice(next.indexOf(target) + (side === "after" ? 1 : 0), 0, source);
  return next;
}
