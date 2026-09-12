import { StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import type { ExportedXlsxFileResponse } from "@/shared/application/export/xlsx-export-file";

// 기능 : xlsx 파일 응답 헤더를 설정하고 다운로드용 StreamableFile을 생성합니다.
export function createXlsxDownloadResponse(
  response: Response,
  file: ExportedXlsxFileResponse
): StreamableFile {
  // 1. 이후 단계에서 사용할 asciiFileName 값을 준비한다.
  const asciiFileName = createAsciiDownloadFileName(file.fileName);
  // 2. 이후 단계에서 사용할 encodedFileName 값을 준비한다.
  const encodedFileName = encodeURIComponent(file.fileName);

  // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
  response.setHeader("Content-Type", file.contentType);
  // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`
  );
  // 5. 화면 상태를 현재 흐름에 맞게 갱신한다.
  response.setHeader("Content-Length", file.content.length.toString());

  // 6. 계산된 결과를 호출자에게 반환한다.
  return new StreamableFile(file.content);
}

// 기능 : Content-Disposition filename fallback에 사용할 ASCII 파일명을 생성합니다.
function createAsciiDownloadFileName(fileName: string): string {
  const normalized = fileName
    .replace(/["\\]/g, "_")
    .replace(/[^\x20-\x7E]/g, "_");

  return normalized.trim() || "download.xlsx";
}
