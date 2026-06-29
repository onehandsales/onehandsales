import type { Buffer } from "node:buffer";

export const BUSINESS_CARD_OCR_PROVIDER = Symbol("BUSINESS_CARD_OCR_PROVIDER");

// 역할 : BusinessCardOcrImageFile OCR provider에 전달할 업로드 이미지 파일을 정의합니다.
export interface BusinessCardOcrImageFile {
  readonly buffer: Buffer;
  readonly fileName: string;
  readonly mimeType: string;
  readonly size: number;
}

// 역할 : BusinessCardExtractedFields 명함 이미지에서 추출한 생성 후보 필드를 정의합니다.
export interface BusinessCardExtractedFields {
  readonly companyName: string | null;
  readonly companyFieldName: string | null;
  readonly companyRegionName: string | null;
  readonly contactName: string | null;
  readonly contactMobile: string | null;
  readonly contactEmail: string | null;
  readonly contactDepartmentName: string | null;
  readonly contactJobGradeName: string | null;
}

// 역할 : BusinessCardOcrUsage provider 사용량과 비용 분석용 값을 정의합니다.
export interface BusinessCardOcrUsage {
  readonly requestToken: number | null;
  readonly responseToken: number | null;
  readonly totalToken: number | null;
  readonly requestCost: number | null;
  readonly responseCost: number | null;
  readonly totalCost: number | null;
}

// 역할 : BusinessCardOcrProviderMetadata 실패 로그에도 남겨야 하는 provider 메타데이터를 정의합니다.
export interface BusinessCardOcrProviderMetadata {
  readonly aiProvider: string;
  readonly aiModel: string;
  readonly promptSnapshot: string;
  readonly costCurrency: string;
}

// 역할 : BusinessCardOcrProviderResult OCR provider 응답 계약을 정의합니다.
export interface BusinessCardOcrProviderResult {
  readonly extracted: BusinessCardExtractedFields;
  readonly usage: BusinessCardOcrUsage;
}

// 역할 : BusinessCardOcrProvider 명함 OCR 외부 provider를 application 계층에서 분리합니다.
export interface BusinessCardOcrProvider {
  // 기능 : 실패 로그 생성에도 사용할 provider 메타데이터를 반환합니다.
  getMetadata(): BusinessCardOcrProviderMetadata;
  // 기능 : 명함 이미지를 구조화된 후보 필드로 변환합니다.
  extract(input: {
    readonly imageFile: BusinessCardOcrImageFile;
  }): Promise<BusinessCardOcrProviderResult>;
}
