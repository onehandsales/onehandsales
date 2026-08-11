import { Inject, Injectable } from "@nestjs/common";
import {
  AdminAuditAction,
  AdminAuditResult,
  AdminOperationCheckRunStatus,
  AdminTargetType,
} from "@prisma/client";
import {
  ADMIN_SYSTEM_OPERATION_REPOSITORY,
  type AdminOperationCheckEnvironment,
  type AdminOperationCheckItemsRecord,
  type AdminOperationCheckRunRecord,
  type AdminSystemOperationRepository,
} from "@/modules/admin-operation/application/ports/admin-system-operation.repository";
import {
  AdminForbiddenError,
  AdminSystemCheckStatusInvalidError,
  AdminSystemEnvironmentUnsupportedError,
  AdminSystemSecretInNoteBlockedError,
} from "@/modules/admin-operation/domain/admin-operation.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

const OPERATION_CHECK_ENVIRONMENTS: readonly AdminOperationCheckEnvironment[] = [
  "local",
  "qa",
  "staging",
  "production",
];
const OPERATION_CHECK_STATUSES = Object.values(AdminOperationCheckRunStatus);
const OPERATION_CHECK_ITEM_KEYS = [
  "prismaValidate",
  "prismaGenerate",
  "migrationStatus",
  "seedNotRunOnSharedDb",
  "backupVerified",
  "restoreDryRun",
  "providerSmoke",
] as const;
const SECRET_NOTE_PATTERNS = [
  /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/\S+/i,
  /\b(?:DATABASE_URL|DB_URL|SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|ACCESS_TOKEN|REFRESH_TOKEN|API_KEY|SECRET|TOKEN|PASSWORD)\b\s*[:=]\s*\S+/i,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/i,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/i,
];

// 역할 : AdminSystemOperationMetadata Admin 운영 gate API 추적 정보를 정의합니다.
export interface AdminSystemOperationMetadata {
  readonly requestId: string;
}

// 역할 : CreateAdminOperationCheckRunCommand 운영 gate 점검 생성 입력을 정의합니다.
export interface CreateAdminOperationCheckRunCommand {
  readonly environment?: string;
  readonly status?: string;
  readonly items?: Partial<Record<(typeof OPERATION_CHECK_ITEM_KEYS)[number], string>>;
  readonly notes?: string;
}

// 역할 : AdminSystemOperationApplicationService 운영 gate 점검 조회와 기록 유스케이스를 제공합니다.
@Injectable()
export class AdminSystemOperationApplicationService {
  // 기능 : Admin 운영 gate 저장소 구현체를 주입받습니다.
  constructor(
    @Inject(ADMIN_SYSTEM_OPERATION_REPOSITORY)
    private readonly systemOperationRepository: AdminSystemOperationRepository
  ) {}

  // 기능 : 최신 운영 DB gate 점검 결과를 조회하고 audit를 남깁니다.
  async getLatestOperationCheckRun(
    currentUser: CurrentUserContext,
    metadata: AdminSystemOperationMetadata
  ): Promise<AdminOperationCheckRunRecord | null> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. 최신 점검 기록 조회와 조회 audit 생성을 하나의 transaction으로 묶습니다.
    const run = await this.systemOperationRepository.runInTransaction(
      async (repository) => {
        const latestRun = await repository.findLatestOperationCheckRun();

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: null,
          targetType: AdminTargetType.SYSTEM_OPERATION_CHECK,
          targetId: latestRun?.id ?? null,
          action: AdminAuditAction.ADMIN_SYSTEM_CHECK_VIEW,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "systemOperationChecksLatest",
            hasLatest: Boolean(latestRun),
          },
        });

        return latestRun;
      }
    );

    // 3. secret 없는 최신 점검 application record 또는 null을 반환합니다.
    return run;
  }

  // 기능 : 운영 DB gate 점검 결과를 secret 없이 기록합니다.
  async createOperationCheckRun(
    currentUser: CurrentUserContext,
    command: CreateAdminOperationCheckRunCommand,
    metadata: AdminSystemOperationMetadata
  ): Promise<AdminOperationCheckRunRecord> {
    // 1. application 계층에서도 관리자 권한을 확인합니다.
    this.assertAdmin(currentUser);

    // 2. 운영 점검 입력값과 secret 의심 notes를 저장 전에 검증합니다.
    const environment = this.normalizeEnvironment(command.environment);
    const status = this.normalizeStatus(command.status, "status");
    const items = this.normalizeItems(command.items);
    const notes = this.normalizeNotes(command.notes);
    const checkedAt = new Date();

    // 3. check run 생성과 audit 생성을 같은 transaction으로 묶습니다.
    const run = await this.systemOperationRepository.runInTransaction(
      async (repository) => {
        const createdRun = await repository.createOperationCheckRun({
          adminUserId: currentUser.id,
          environment,
          status,
          items,
          notes,
          checkedAt,
        });

        await repository.createAuditLog({
          adminUserId: currentUser.id,
          targetUserId: null,
          targetType: AdminTargetType.SYSTEM_OPERATION_CHECK,
          targetId: createdRun.id,
          action: AdminAuditAction.ADMIN_SYSTEM_CHECK_RECORDED,
          result: AdminAuditResult.SUCCESS,
          requestId: metadata.requestId,
          metadataJson: {
            endpoint: "systemOperationChecks",
            environment,
            status,
            items,
          },
        });

        return createdRun;
      }
    );

    // 4. 저장된 점검 기록을 application record로 반환합니다.
    return run;
  }

  // 기능 : 관리자 권한이 아닌 application 호출을 거부합니다.
  private assertAdmin(currentUser: CurrentUserContext): void {
    if (currentUser.role !== "ADMIN") {
      throw new AdminForbiddenError();
    }
  }

  // 기능 : 운영 gate 대상 environment를 allowlist 기준으로 정규화합니다.
  private normalizeEnvironment(
    value: string | undefined
  ): AdminOperationCheckEnvironment {
    const normalized = value?.trim().toLowerCase();

    if (
      OPERATION_CHECK_ENVIRONMENTS.some(
        (environment) => environment === normalized
      )
    ) {
      return normalized as AdminOperationCheckEnvironment;
    }

    throw new AdminSystemEnvironmentUnsupportedError();
  }

  // 기능 : 운영 gate 전체 또는 항목 status를 allowlist 기준으로 정규화합니다.
  private normalizeStatus(
    value: string | undefined,
    field: string
  ): AdminOperationCheckRunStatus {
    const normalized = value?.trim().toUpperCase();

    if (OPERATION_CHECK_STATUSES.some((status) => status === normalized)) {
      return normalized as AdminOperationCheckRunStatus;
    }

    throw new AdminSystemCheckStatusInvalidError(field);
  }

  // 기능 : 운영 gate 점검 항목별 status를 빠짐없이 정규화합니다.
  private normalizeItems(
    value: CreateAdminOperationCheckRunCommand["items"]
  ): AdminOperationCheckItemsRecord {
    return Object.fromEntries(
      OPERATION_CHECK_ITEM_KEYS.map((key) => [
        key,
        this.normalizeStatus(value?.[key], `items.${key}`),
      ])
    ) as unknown as AdminOperationCheckItemsRecord;
  }

  // 기능 : notes에 DB URL 또는 token 의심값이 포함됐는지 검사합니다.
  private normalizeNotes(value: string | undefined): string | null {
    const normalized = value?.trim();

    if (!normalized) {
      return null;
    }

    if (SECRET_NOTE_PATTERNS.some((pattern) => pattern.test(normalized))) {
      throw new AdminSystemSecretInNoteBlockedError();
    }

    return normalized;
  }
}
