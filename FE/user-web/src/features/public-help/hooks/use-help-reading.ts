import { useEffect, useState } from "react";
import { portalSections } from "../data/portal-sections";
// 기능 : 목차 클릭과 별도로 현재 읽는 문서 구간을 스크롤에서 추적한다.
export function useHelpReading() {
  const [active, setActive] = useState<string>(portalSections[0].id);
  useEffect(function observeArticlePosition() {
    // 기능 : 화면 위쪽에 도착한 마지막 제목을 활성 목차로 선택한다.
    function update() { let id: string = portalSections[0].id; for (const section of portalSections) if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= 100) id = section.id; setActive(id); }
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return active;
}
