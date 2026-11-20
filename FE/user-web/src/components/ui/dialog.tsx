import { useEffect, useId, useRef } from "react";
import type { ReactNode, MouseEvent, SyntheticEvent, KeyboardEvent } from "react";
import { X } from "lucide-react";

type DialogProps = { title: string; description?: string; children: ReactNode; footer?: ReactNode; onClose: () => void };

// 기능 : 네이티브 모달의 초점·배경 비활성·닫기와 스크롤 수명을 공통으로 관리한다.
export function Dialog({ title, description, children, footer, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef(onClose);
  // 기능 : 모달 생명주기를 재시작하지 않고 최신 닫기 의도를 보관한다.
  useEffect(function updateCloseHandler() { closeRef.current = onClose; }, [onClose]);
  // 기능 : 모달을 열고 초점과 페이지 스크롤을 모달 수명에 연결한다.
  useEffect(function openModal() {
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    // 이유 : 제목을 먼저 읽은 후 입력으로 이동하게 하며 정적 캡처에 없는 접근성 보완이다.
    dialog.querySelector<HTMLElement>("[data-dialog-heading]")?.focus();
    // 기능 : 종료 시 이전 스크롤과 살아 있는 원래 초점을 복원한다.
    return function restorePage() {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  // 기능 : 모달 바깥 영역을 누르면 초안을 닫는 의도를 부모에 전달한다.
  function handleBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeRef.current();
  }
  // 기능 : 브라우저의 기본 닫기와 React 열림 상태가 어긋나지 않게 취소를 부모에 위임한다.
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeRef.current();
  }
  // 기능 : 첫 요소와 마지막 요소 사이의 Tab 이동을 순환시켜 모달 안에 초점을 유지한다.
  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
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
  return <dialog ref={ref} className="dialog" aria-labelledby={titleId}
    aria-describedby={description ? descriptionId : undefined}
    onCancel={handleCancel} onClick={handleBackdrop} onKeyDown={handleKeyDown}>
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
