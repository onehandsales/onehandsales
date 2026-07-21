import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  DeleteImportUploadedFileInput,
  ImportUploadedFileStorage,
  StoreImportUploadedFileInput,
  StoredImportUploadedFileReference,
} from "@/modules/data-import/application/ports/import-uploaded-file-storage.port";

const STORAGE_PROVIDER = "LOCAL";

// 역할 : LocalImportUploadedFileStorage 로컬 파일 시스템에 import 원본 파일을 저장합니다.
export class LocalImportUploadedFileStorage implements ImportUploadedFileStorage {
  // 기능 : import 원본 파일을 저장할 로컬 root directory를 설정합니다.
  constructor(private readonly rootDir = join(process.cwd(), "var", "imports")) {}

  // 기능 : 업로드 원본 파일을 사용자/job별 경로에 저장하고 checksum과 storage key를 반환합니다.
  async store(
    input: StoreImportUploadedFileInput
  ): Promise<StoredImportUploadedFileReference> {
    const checksum = createHash("sha256").update(input.buffer).digest("hex");
    const safeName = this.toSafeFileName(input.originalFileName);
    const storageKey = join(input.userId, input.importJobId, safeName);
    const absolutePath = join(this.rootDir, storageKey);

    await mkdir(join(this.rootDir, input.userId, input.importJobId), {
      recursive: true,
    });
    await writeFile(absolutePath, input.buffer);

    return {
      checksum,
      storageProvider: STORAGE_PROVIDER,
      storageBucket: null,
      storageKey,
    };
  }

  // 기능 : storage key 기준으로 저장된 원본 파일을 삭제합니다.
  async delete(input: DeleteImportUploadedFileInput): Promise<void> {
    await rm(join(this.rootDir, input.storageKey), {
      force: true,
    });
  }

  // 기능 : 사용자 파일명을 로컬 파일 시스템에 안전한 이름으로 변환합니다.
  private toSafeFileName(fileName: string): string {
    const normalized = fileName.trim().replace(/[\\/:*?"<>|]/g, "_");

    return normalized.length > 0 ? normalized : "upload";
  }
}
