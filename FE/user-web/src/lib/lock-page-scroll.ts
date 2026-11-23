const locks = new WeakMap<HTMLElement, { count: number; value: string; priority: string }>();

// 기능 : 중첩 모달의 해제 순서와 관계없이 마지막 모달이 닫힐 때 원래 페이지 스크롤을 복원한다.
export function lockPageScroll(body: HTMLElement) {
  const lock = locks.get(body) ?? {
    count: 0,
    value: body.style.getPropertyValue("overflow"),
    priority: body.style.getPropertyPriority("overflow"),
  };
  lock.count += 1;
  locks.set(body, lock);
  body.style.setProperty("overflow", "hidden");
  let released = false;

  // 기능 : 현재 모달의 잠금을 한 번만 해제하고 남은 모달의 스크롤 잠금을 유지한다.
  return function unlockPageScroll() {
    if (released) return;
    released = true;
    lock.count -= 1;
    if (lock.count > 0) return;
    if (lock.value) body.style.setProperty("overflow", lock.value, lock.priority);
    else body.style.removeProperty("overflow");
    locks.delete(body);
  };
}
