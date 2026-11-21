import { useEffect, useState } from "react";
import { articleSections } from "../data/article-sections";

// 기능 : 목차 클릭 목적지와 별개로 실제 문서의 현재 읽는 구간·하단 CTA 노출을 추적한다.
export function useArticleReading() {
  const [active, setActive] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  useEffect(function observeReadingPosition() {
    // 기능 : 고정 헤더 아래에 도달한 마지막 제목을 현재 읽는 구간으로 표시한다.
    function update() {
      let current = "";
      for (const section of articleSections) {
        if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= 180) current = section.id;
      }
      setActive(current); setShowSignup((document.getElementById("article-body")?.getBoundingClientRect().top ?? Infinity) < 400);
    }
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return { active, showSignup };
}
