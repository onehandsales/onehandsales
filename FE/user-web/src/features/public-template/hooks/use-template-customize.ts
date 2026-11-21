import { useEffect, useState } from "react";

// 기능 : 원본 상세의 본문 진입 후 이메일 바를 노출하고 화면 이탈 시 스크롤 관찰을 정리한다.
export function useTemplateCustomize() {
  const [visible, setVisible] = useState(false);
  // 기능 : 영웅 영역과 본문에서 서로 다른 CTA 표시 상태를 적용한다.
  useEffect(function observeDetailScroll() {
    // 기능 : 스크롤 임계값은 원본 전환 시점 미확인에 따른 목 값이다.
    function update() { setVisible(window.scrollY > 450); }
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return visible;
}
