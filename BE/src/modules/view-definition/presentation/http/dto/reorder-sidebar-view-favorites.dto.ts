import { IsArray, IsUUID } from "class-validator";

// 역할 : 사이드바 전체 항목의 최종 순서만 받는 HTTP 입력입니다.
export class ReorderSidebarViewFavoritesDto {
  @IsArray()
  @IsUUID("all", { each: true })
  orderedIds!: string[];
}
