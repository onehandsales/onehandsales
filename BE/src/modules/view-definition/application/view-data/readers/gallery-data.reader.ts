import type { ViewDataQueryContext } from "../view-data-query-context";
import type { ViewMainDataByType } from "../view-data.types";
import { displayValue } from "../view-data-values";
// 기능 : 카드 본문과 허용 이미지 주소를 표시 설정에 맞춰 반환합니다.
export function readGalleryData(
  context: ViewDataQueryContext,
): ViewMainDataByType["GALLERY"] {
  const presentation = context.presentation(
    { cardSize: "MEDIUM", imageFit: "CONTAIN" },
    { cardSize: ["SMALL", "MEDIUM", "LARGE"], imageFit: ["CONTAIN", "COVER"] },
  );
  const image = context.binding("IMAGE", ["Text"], false),
    body = context.binding("BODY", ["Text"], false);
  const page = context.page(context.items);
  return {
    presentation,
    pageInfo: page.pageInfo,
    cards: page.items.map((source) => {
      const item = context.values.item(source);
      const src = item.cells.find((cell) => cell.bindingId === image?.id)
        ?.values[0]?.value;
      const valid =
        typeof src === "string" &&
        src.length <= 262144 &&
        (/^https:\/\//i.test(src) ||
          /^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(src) ||
          /^data:image\/svg\+xml(?:;charset=[\w-]+)?,/i.test(src));
      return {
        item,
        body:
          item.cells
            .find((cell) => cell.bindingId === body?.id)
            ?.values.map((value) => displayValue(value.value))
            .join("\n") || null,
        image: valid ? { src: src as string, alt: item.title } : null,
      };
    }),
  };
}
