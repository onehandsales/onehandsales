import { useEffect, useId, useRef } from "react";
import type { ReactNode, MouseEvent, PointerEvent, SyntheticEvent, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { lockPageScroll } from "@/lib/lock-page-scroll";

type DialogProps = { className?: string; title: string; description?: string; children: ReactNode; footer?: ReactNode; onClose: () => void };

// 기능 : 네이티브 모달의 초점·배경 비활성·닫기와 스크롤 수명을 공통으로 관리한다.
export function Dialog({ title, description, children, footer, onClose, className = "" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef(onClose);
  const backdropPointer = useRef<number | null>(null);
  // 기능 : 모달 생명주기를 재시작하지 않고 최신 닫기 의도를 보관한다.
  useEffect(function updateCloseHandler() { closeRef.current = onClose; }, [onClose]);
  // 기능 : 모달을 열고 초점과 페이지 스크롤을 모달 수명에 연결한다.
  useEffect(function openModal() {
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    dialog.showModal();
    const unlockScroll = lockPageScroll(document.body);
    // 이유 : 제목을 먼저 읽은 후 입력으로 이동하게 하며 정적 캡처에 없는 접근성 보완이다.
    dialog.querySelector<HTMLElement>("[data-dialog-heading]")?.focus();
    // 기능 : 종료 시 이전 스크롤과 살아 있는 원래 초점을 복원한다.
    return function restorePage() {
      dialog.close();
      unlockScroll();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  // 기능 : 배경에서 시작한 기본 포인터만 기록해 입력 선택 드래그와 닫기 클릭을 구분한다.
  function handlePointerDown(event: PointerEvent<HTMLDialogElement>) {
    backdropPointer.current = event.target === event.currentTarget && event.button === 0 ? event.pointerId : null;
  }
  // 기능 : 같은 포인터가 실제 배경에서 끝난 경우에만 닫기 의도를 유지한다.
  function handlePointerUp(event: PointerEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget || backdropPointer.current !== event.pointerId) backdropPointer.current = null;
  }
  // 기능 : 취소된 포인터의 닫기 의도를 폐기한다.
  function handlePointerCancel() { backdropPointer.current = null; }
  // 기능 : 배경에서 시작하고 끝난 클릭만 초안 닫기로 처리한다.
  function handleBackdrop(event: MouseEvent<HTMLDialogElement>) {
    const startedOnBackdrop = backdropPointer.current !== null;
    backdropPointer.current = null;
    if (startedOnBackdrop && event.target === event.currentTarget) closeRef.current();
  }
  // 기능 : 브라우저의 기본 닫기와 React 열림 상태가 어긋나지 않게 취소를 부모에 위임한다.
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    event.stopPropagation();
    closeRef.current();
  }
  // 기능 : 첫 요소와 마지막 요소 사이의 Tab 이동을 순환시켜 모달 안에 초점을 유지한다.
  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    event.stopPropagation();
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'button:enabled, input:enabled, select:enabled, textarea:enabled, a[href], [tabindex="0"]',
    )).filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;
    if (!first || !last) { event.preventDefault(); return; }
    if (event.shiftKey && (current === first || !focusable.some((element) => element === current))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault(); first.focus();
    }
  }
  return <dialog ref={ref} className={"dialog " + className} aria-labelledby={titleId}
    aria-describedby={description ? descriptionId : undefined}
    onCancel={handleCancel} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}
    onClick={handleBackdrop} onKeyDown={handleKeyDown}>
    <div className="dialog__surface">
      <button type="button" className="dialog__close" aria-label="Close dialog" onClick={onClose}><X aria-hidden="true" size={24} strokeWidth={1} /></button>
      <div className="dialog__content">
        <h2 id={titleId} tabIndex={-1} data-dialog-heading>{title}</h2>
        {description && <p id={descriptionId} className="dialog__description">{description}</p>}
        {children}
      </div>
      {footer && <div className="dialog__footer">{footer}</div>}
    </div>
  </dialog>;
}
