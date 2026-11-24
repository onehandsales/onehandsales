import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";

const unconfirmedLabel = "brand questionnaire";

// 기능 : 원본에 보이는 인라인 링크를 표시하되 미확인 목적지를 임의의 템플릿으로 연결하지 않는다.
export function ArticleParagraph({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const position = text.indexOf(unconfirmedLabel);
  // 기능 : 원본 목적지가 미확인이라는 로컬 안내만 연다.
  function openBoundary() { setOpen(true); }
  // 기능 : 기사 위치를 바꾸지 않고 원래 링크 초점으로 복귀한다.
  function closeBoundary() { setOpen(false); }
  if (position < 0) return <p>{text}</p>;
  return <><p>{text.slice(0, position)}<button type="button" className="article-source-link" onClick={openBoundary}>{unconfirmedLabel}</button>{text.slice(position + unconfirmedLabel.length)}</p>
    {open && <Dialog title="Brand questionnaire" onClose={closeBoundary}><p>원본에서 링크 표시는 확인했지만 연결 목적지와 이후 화면은 확인되지 않았습니다.</p><button type="button" className="public-button" onClick={closeBoundary}>Back to article</button></Dialog>}</>;
}
