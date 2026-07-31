import { describe, expect, it } from "vitest";
import {
  BUSINESS_CARD_MAX_FILE_SIZE_BYTES,
  validateBusinessCardImage,
} from "./business-card-schema";

// 기능 : 테스트용 명함 이미지 File 객체를 생성합니다.
function createImageFile(type: string, size = 1024) {
  return new File([new Uint8Array(size)], "card", { type });
}

describe("validateBusinessCardImage", () => {
  it("accepts jpeg, png and webp images up to 10MB", () => {
    expect(validateBusinessCardImage(createImageFile("image/jpeg"))).toBeNull();
    expect(validateBusinessCardImage(createImageFile("image/png"))).toBeNull();
    expect(validateBusinessCardImage(createImageFile("image/webp"))).toBeNull();
  });

  it("rejects empty, unsupported or oversized image files with mobile copy", () => {
    expect(validateBusinessCardImage(null)).toBe(
      "명함 이미지 파일을 선택해 주세요."
    );
    expect(validateBusinessCardImage(createImageFile("image/gif"))).toBe(
      "JPG, PNG, WebP 이미지만 올릴 수 있어요."
    );
    expect(
      validateBusinessCardImage(
        createImageFile("image/jpeg", BUSINESS_CARD_MAX_FILE_SIZE_BYTES + 1)
      )
    ).toBe("10MB 이하 이미지만 올릴 수 있어요.");
  });
});
