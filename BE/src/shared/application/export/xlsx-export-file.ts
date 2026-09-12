import { Buffer } from "node:buffer";

export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// 역할 : ExportedXlsxFileResponse xlsx 다운로드 응답에 필요한 파일 정보를 정의합니다.
export interface ExportedXlsxFileResponse {
  readonly fileName: string;
  readonly contentType: string;
  readonly content: Buffer;
}

// 기능 : 현재 시각을 포함한 xlsx 파일명을 생성합니다.
export function createTimestampedXlsxFileName(
  prefix: string,
  now = new Date()
): string {
  // 1. 이후 처리에 사용할 year을 계산한다.
  const year = now.getFullYear().toString();
  // 2. 이후 처리에 사용할 month을 계산한다.
  const month = padDatePart(now.getMonth() + 1);
  // 3. 이후 처리에 사용할 day을 계산한다.
  const day = padDatePart(now.getDate());
  // 4. 이후 처리에 사용할 hour을 계산한다.
  const hour = padDatePart(now.getHours());
  // 5. 이후 처리에 사용할 minute을 계산한다.
  const minute = padDatePart(now.getMinutes());
  // 6. 이후 처리에 사용할 second을 계산한다.
  const second = padDatePart(now.getSeconds());

  // 7. 계산된 결과를 호출자에게 반환한다.
  return `${prefix}_${year}${month}${day}_${hour}${minute}${second}.xlsx`;
}

// 기능 : 파일명에 사용하는 날짜 숫자를 2자리 문자열로 변환합니다.
function padDatePart(value: number): string {
  return value.toString().padStart(2, "0");
}
