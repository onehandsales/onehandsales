import { createHash, randomUUID } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import type {
  ErrorReportScreenshotStorage,
  StoreErrorReportScreenshotInput,
  StoredErrorReportScreenshotReference,
} from "@/modules/error-report/application/ports/error-report-screenshot-storage.port";
import { ErrorReportScreenshotStorageFailedError } from "@/modules/error-report/domain/error-report.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { getRequiredConfig } from "@/shared/infrastructure/supabase/supabase-env";

const STORAGE_PROVIDER = "SUPABASE";
const STORAGE_OBJECT_PREFIX = "error-reports";

// 역할 : SupabaseErrorReportScreenshotStorage Supabase Storage에 에러 신고 screenshot을 저장합니다.
export class SupabaseErrorReportScreenshotStorage
  implements ErrorReportScreenshotStorage
{
  // 기능 : ConfigService와 logger를 주입받아 Supabase Storage 요청에 사용합니다.
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  // 기능 : PNG screenshot을 Supabase Storage object로 업로드하고 참조 metadata를 반환합니다.
  async store(
    input: StoreErrorReportScreenshotInput
  ): Promise<StoredErrorReportScreenshotReference> {
    // 1. 이후 처리에 사용할 config을 계산한다.
    const config = this.getConfig();
    // 2. 이후 처리에 사용할 fileName을 계산한다.
    const fileName = this.createFileName(input.capturedAt);
    // 3. 이후 처리에 사용할 storageKey을 계산한다.
    const storageKey = this.createStorageKey(input.userId, input.capturedAt, fileName);
    // 4. 이후 처리에 사용할 checksum을 계산한다.
    const checksum = createHash("sha256").update(input.buffer).digest("hex");
    // 5. 비동기 결과를 받아 response에 저장한다.
    const response = await fetch(this.createObjectUrl(config, storageKey), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        apikey: config.secretKey,
        "cache-control": "3600",
        "Content-Type": input.mimeType,
        "x-upsert": "false",
      },
      body: new Uint8Array(input.buffer),
    });

    // 6. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!response.ok) {
      this.logUploadFailure(response.status);
      throw new ErrorReportScreenshotStorageFailedError();
    }

    // 7. 계산된 결과를 호출자에게 반환한다.
    return {
      checksum,
      fileName,
      storageProvider: STORAGE_PROVIDER,
      storageBucket: config.bucket,
      storageKey,
    };
  }

  // 기능 : Supabase Storage 사용에 필요한 환경 변수를 읽습니다.
  private getConfig(): SupabaseErrorReportStorageConfig {
    return {
      bucket: getRequiredConfig(
        this.configService,
        "SUPABASE_STORAGE_ERROR_REPORT_BUCKET"
      ),
      secretKey: getRequiredConfig(this.configService, "SUPABASE_SECRET_KEY"),
      supabaseUrl: getRequiredConfig(this.configService, "SUPABASE_URL"),
    };
  }

  // 기능 : Supabase Storage object 업로드 URL을 생성합니다.
  private createObjectUrl(
    config: SupabaseErrorReportStorageConfig,
    storageKey: string
  ): string {
    const baseUrl = config.supabaseUrl.endsWith("/")
      ? config.supabaseUrl.slice(0, -1)
      : config.supabaseUrl;
    const encodedPath = [config.bucket, ...storageKey.split("/")]
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return `${baseUrl}/storage/v1/object/${encodedPath}`;
  }

  // 기능 : UTC 시각과 UUID로 screenshot 파일명을 생성합니다.
  private createFileName(capturedAt: Date): string {
    // 1. 이후 처리에 사용할 year을 계산한다.
    const year = String(capturedAt.getUTCFullYear()).padStart(4, "0");
    // 2. 이후 처리에 사용할 month을 계산한다.
    const month = String(capturedAt.getUTCMonth() + 1).padStart(2, "0");
    // 3. 이후 처리에 사용할 day을 계산한다.
    const day = String(capturedAt.getUTCDate()).padStart(2, "0");
    // 4. 이후 처리에 사용할 hour을 계산한다.
    const hour = String(capturedAt.getUTCHours()).padStart(2, "0");
    // 5. 이후 처리에 사용할 minute을 계산한다.
    const minute = String(capturedAt.getUTCMinutes()).padStart(2, "0");
    // 6. 이후 처리에 사용할 second을 계산한다.
    const second = String(capturedAt.getUTCSeconds()).padStart(2, "0");

    // 7. 계산된 결과를 호출자에게 반환한다.
    return `${year}${month}${day}_${hour}${minute}${second}_${randomUUID()}.png`;
  }

  // 기능 : 사용자와 UTC 날짜 기준으로 screenshot object key를 생성합니다.
  private createStorageKey(
    userId: string,
    capturedAt: Date,
    fileName: string
  ): string {
    // 1. 이후 처리에 사용할 year을 계산한다.
    const year = String(capturedAt.getUTCFullYear()).padStart(4, "0");
    // 2. 이후 처리에 사용할 month을 계산한다.
    const month = String(capturedAt.getUTCMonth() + 1).padStart(2, "0");
    // 3. 이후 처리에 사용할 day을 계산한다.
    const day = String(capturedAt.getUTCDate()).padStart(2, "0");

    // 4. 계산된 결과를 호출자에게 반환한다.
    return [
      STORAGE_OBJECT_PREFIX,
      userId,
      year,
      month,
      day,
      fileName,
    ].join("/");
  }

  // 기능 : Supabase 응답 body 없이 안전한 status만 구조화 로그로 남깁니다.
  private logUploadFailure(statusCode: number): void {
    this.logger.error(
      JSON.stringify({
        event: "errorReport.supabaseScreenshotUploadFailed",
        statusCode,
        storageProvider: STORAGE_PROVIDER,
      }),
      "SupabaseStorageUploadFailed",
      "SupabaseErrorReportScreenshotStorage"
    );
  }
}

// 역할 : SupabaseErrorReportStorageConfig Supabase Storage 환경 설정 값을 정의합니다.
interface SupabaseErrorReportStorageConfig {
  readonly bucket: string;
  readonly secretKey: string;
  readonly supabaseUrl: string;
}
