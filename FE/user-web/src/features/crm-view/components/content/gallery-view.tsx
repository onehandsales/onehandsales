import { useState } from "react";
import type { ViewContentProps } from "./view-content-shared";
import { ViewRecordCard, ViewEmpty } from "./view-content-shared";
// 기능 : 표시 크기·이미지 fit과 본문을 카드 격자로 표시합니다.
export function GalleryView({ response }: ViewContentProps<"GALLERY">) {
  const { data } = response;
  if (!data.cards.length) return <ViewEmpty />;
  const size =
    data.presentation.cardSize === "SMALL"
      ? 180
      : data.presentation.cardSize === "LARGE"
        ? 340
        : 250;
  return (
    <div
      className="grid gap-4 p-4"
      style={{
        gridTemplateColumns: `repeat(auto-fill,minmax(min(100%,${size}px),1fr))`,
      }}
      data-testid="view-gallery"
    >
      {data.cards.map((card) => (
        <div
          key={card.item.occurrenceKey}
          className="overflow-hidden rounded-md border border-[#E8E7E4]"
        >
          {card.image && (
            <GalleryImage
              src={card.image.src}
              alt={card.image.alt}
              cover={data.presentation.imageFit === "COVER"}
            />
          )}
          {card.body && (
            <p className="line-clamp-4 whitespace-pre-wrap px-3 pt-3 text-xs text-[#787774]">
              {card.body}
            </p>
          )}
          <ViewRecordCard item={card.item} bindings={response.bindings} />
        </div>
      ))}
    </div>
  );
}
// 기능 : 깨진 이미지 요청은 카드의 정보 표시를 방해하지 않게 숨깁니다.
function GalleryImage({
  src,
  alt,
  cover,
}: {
  src: string;
  alt: string;
  cover: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? null : (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={`h-40 w-full bg-[#F7F7F5] ${cover ? "object-cover" : "object-contain"}`}
      onError={() => setFailed(true)}
    />
  );
}
