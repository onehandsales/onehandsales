import { useEffect, useRef, useState } from "react";
import type { FocusEvent, PointerEvent } from "react";

// 기능 : 공개 메뉴의 hover·클릭·키보드·외부 닫기와 트리거 초점 복귀를 관리한다.
export function usePublicMenu() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const mode = useRef<"hover" | "click">("hover");
  // 기능 : 외부 포인터 조작으로 열린 메뉴를 닫고 리스너를 정리한다.
  useEffect(function observeOutsidePointer() {
    // 기능 : 메뉴 밖 입력에는 초점을 빼앗지 않고 공개 메뉴를 닫는다.
    function handleOutside(event: globalThis.PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(null); setMobileOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);
  // 기능 : 마우스 진입에서는 메뉴를 열되 터치의 합성 hover는 무시한다.
  function hover(name: string, event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse" || !matchMedia("(min-width: 992px)").matches) return;
    mode.current = "hover"; trigger.current = event.currentTarget; setOpen(name);
  }
  // 기능 : 명시적인 클릭은 현재 메뉴를 토글하고 hover에서 열린 첫 클릭은 유지한다.
  function toggle(name: string, target: HTMLButtonElement) {
    const shouldClose = open === name && mode.current === "click";
    mode.current = "click"; trigger.current = target; setOpen(shouldClose ? null : name);
  }
  // 기능 : 마우스로 연 메뉴도 현재 키보드 초점과 무관하게 Escape로 닫는다.
  useEffect(function observeEscape() {
    // 기능 : 열린 공개 메뉴를 닫고 해당 트리거에 키보드 초점을 돌려준다.
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape" || (!open && !mobileOpen)) return;
      event.preventDefault(); setOpen(null);
      if (open) trigger.current?.focus();
      else { setMobileOpen(false); root.current?.querySelector<HTMLButtonElement>(".public-mobile-toggle")?.focus(); }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, mobileOpen]);
  // 기능 : Tab으로 공개 헤더를 완전히 벗어나면 가려진 메뉴를 남기지 않는다.
  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(null); setMobileOpen(false); }
  }
  // 기능 : 포인터가 전체 헤더를 벗어나면 hover 메뉴만 닫는다.
  function leave() { if (mode.current === "hover") setOpen(null); }
  return { open, mobileOpen, setMobileOpen, root, hover, toggle, handleBlur, leave };
}
