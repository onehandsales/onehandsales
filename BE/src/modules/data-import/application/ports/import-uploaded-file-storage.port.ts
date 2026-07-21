import type { Buffer } from "node:buffer";

export const IMPORT_UPLOADED_FILE_STORAGE = Symbol(
  "IMPORT_UPLOADED_FILE_STORAGE"
);

// 역할 : StoreImportUploadedFileInput 업로드 원본 파일 저장 요청 값을 정의합니다.
export interface StoreImportUploadedFileInput {
  readonly userId: string;
  readonly importJobId: string;
  readonly originalFileName: string;
  readonly buffer: Buffer;
}

// 역할 : StoredImportUploadedFileReference DB metadata에 저장할 원본 파일 참조 값을 정의합니다.
export interface StoredImportUploadedFileReference {
  readonly checksum: string;
  readonly storageProvider: string;
  readonly storageBucket: string | null;
  readonly storageKey: string;
}

// 역할 : DeleteImportUploadedFileInput 저장된 원본 파일 삭제 요청 값을 정의합니다.
export interface DeleteImportUploadedFileInput {
  readonly storageKey: string;
}

// 역할 : ImportUploadedFileStorage 업로드 원본 파일 binary 저장소 계약을 정의합니다.
export interface ImportUploadedFileStorage {
  // 기능 : 업로드 원본 파일을 저장하고 DB metadata에 넣을 참조 정보를 반환합니다.
  store(
    input: StoreImportUploadedFileInput
  ): Promise<StoredImportUploadedFileReference>;
  // 기능 : 저장된 업로드 원본 파일을 삭제합니다.
  delete(input: DeleteImportUploadedFileInput): Promise<void>;
}
