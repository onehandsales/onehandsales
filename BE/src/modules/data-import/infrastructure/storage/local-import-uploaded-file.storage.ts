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
  constructor(private readonly rootDir = join(process.cwd(), "var", "imports")) {}

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

  async delete(input: DeleteImportUploadedFileInput): Promise<void> {
    await rm(join(this.rootDir, input.storageKey), {
      force: true,
    });
  }

  private toSafeFileName(fileName: string): string {
    const normalized = fileName.trim().replace(/[\\/:*?"<>|]/g, "_");

    return normalized.length > 0 ? normalized : "upload";
  }
}
