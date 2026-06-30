import { StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import type { ExportedXlsxFileResponse } from "@/shared/application/export/xlsx-export-file";

// 기능 : xlsx 파일 응답 헤더를 설정하고 다운로드용 StreamableFile을 생성합니다.
export function createXlsxDownloadResponse(
  response: Response,
  file: ExportedXlsxFileResponse
): StreamableFile {
  const asciiFileName = createAsciiDownloadFileName(file.fileName);
  const encodedFileName = encodeURIComponent(file.fileName);

  response.setHeader("Content-Type", file.contentType);
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`
  );
  response.setHeader("Content-Length", file.content.length.toString());

  return new StreamableFile(file.content);
}

// 기능 : Content-Disposition filename fallback에 사용할 ASCII 파일명을 생성합니다.
function createAsciiDownloadFileName(fileName: string): string {
  const normalized = fileName
    .replace(/["\\]/g, "_")
    .replace(/[^\x20-\x7E]/g, "_");

  return normalized.trim() || "download.xlsx";
}
