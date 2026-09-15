import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type AuthDeviceRecord,
  type AuthDeviceSlot,
  AUTH_REPOSITORY,
  type AuthRepository,
  type AuthSessionRecord,
  type AuthUserRecord,
} from "@/modules/auth/application/ports/auth.repository";
import {
  APP_TOKEN_ISSUER,
  type AppTokenIssuer,
} from "@/modules/auth/application/ports/app-token.port";
import {
  SECURE_TOKEN_SERVICE,
  type SecureTokenService,
} from "@/modules/auth/application/ports/secure-token.port";
import {
  AuthProviderExchangeFailedError,
  DeviceSlotAlreadyRegisteredError,
  ExternalUserEmailMissingError,
  InactiveUserError,
  InvalidDeviceIdError,
  InvalidDeviceSlotError,
} from "@/modules/auth/domain/auth.errors";
import {
  EXTERNAL_AUTH_VERIFIER,
  type ExternalAuthVerifier,
  type VerifiedExternalUser,
} from "@/shared/application/ports/external-auth-verifier.port";
import { isValidIanaTimeZone } from "@/shared/application/time-zone/time-zone";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { createAuthTokenResponse, type AuthTokenResponse } from "../auth-response";

// 역할 : ExchangeExternalAuthTokenCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ExchangeExternalAuthTokenCommand {
  readonly externalAuthAccessToken: string;
  readonly deviceSlot: string;
  readonly deviceId: string;
  readonly deviceLabel: string | null;
  readonly replaceExistingDevice: boolean;
  readonly locale: string | null;
  readonly timeZone: string | null;
  readonly countryCode: string | null;
  readonly userAgent: string | null;
  readonly ipAddress: string | null;
  readonly requestId: string | null;
}

// 역할 : ExchangeExternalAuthTokenResult 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ExchangeExternalAuthTokenResult {
  readonly response: AuthTokenResponse;
  readonly refreshToken: string;
}

type AuthLoginMetadata = {
  readonly countryCode: string | null;
  readonly locale: string;
  readonly timeZone: string;
  readonly userCountryCode: string;
  readonly defaultCurrencyCode: string;
};

const DEFAULT_USER_LOCALE = "ko-KR";
const DEFAULT_USER_TIME_ZONE = "Asia/Seoul";
const DEFAULT_USER_COUNTRY_CODE = "KR";
const DEFAULT_USER_CURRENCY_CODE = "KRW";

// 역할 : ExchangeExternalAuthTokenUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class ExchangeExternalAuthTokenUseCase {
  // 기능 : 외부 인증 검증기, 저장소, 토큰 서비스, 설정 서비스, logger를 주입받습니다.
  constructor(
    @Inject(EXTERNAL_AUTH_VERIFIER)
    private readonly externalAuthVerifier: ExternalAuthVerifier,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(APP_TOKEN_ISSUER)
    private readonly appTokenIssuer: AppTokenIssuer,
    @Inject(SECURE_TOKEN_SERVICE)
    private readonly secureTokenService: SecureTokenService,
    private readonly configService: ConfigService,
    private readonly logger?: AppLogger
  ) {}

  // 기능 : 외부 인증 토큰을 검증하고 사용자/기기/세션을 생성한 뒤 앱 토큰 응답을 반환합니다.
  async execute(
    command: ExchangeExternalAuthTokenCommand
  ): Promise<ExchangeExternalAuthTokenResult> {
    // 1. 외부 인증 provider access token을 검증하고 원문 오류는 안전한 교환 실패로 축소한다.
    const verifiedUser = await this.verifyExternalUser(
      command.externalAuthAccessToken
    );

    // 2. provider 사용자 정보와 기기 입력값을 내부 형식으로 검증/정규화한다.
    const email = this.normalizeEmail(verifiedUser.email, verifiedUser.provider);
    const slot = this.parseDeviceSlot(command.deviceSlot);
    const countryCode = this.normalizeCountryCode(command.countryCode);
    const userCountryCode = this.resolveUserCountryCode(countryCode);
    const loginMetadata: AuthLoginMetadata = {
      countryCode,
      locale: this.normalizeLocale(command.locale),
      timeZone: this.normalizeTimeZone(command.timeZone),
      userCountryCode,
      defaultCurrencyCode: this.resolveDefaultCurrencyCode(userCountryCode),
    };
    this.assertDeviceId(command.deviceId);

    // 3. 사용자, 기기, 세션 생성을 하나의 transaction 안에서 처리한다.
    const transactionResult = await this.authRepository.runInTransaction(
      async (repository): Promise<ExchangeExternalAuthTokenResult> => {
        // 1. 시간 계산에 필요한 기준 값을 준비한다.
        const now = new Date();

        // 4. provider 계정 기준으로 내부 사용자를 생성하거나 갱신한다.
        const user = await this.syncUser(
          repository,
          verifiedUser,
          email,
          now,
          loginMetadata
        );
        // 3. 현재 단계에서 필요한 동작을 실행한다.
        this.assertActiveUser(user);

        // 5. 기기 slot 충돌, 갱신, 교체 정책을 처리한다.
        const device = await this.resolveDevice(repository, {
          user,
          slot,
          deviceId: command.deviceId,
          deviceLabel: command.deviceLabel,
          replaceExistingDevice: command.replaceExistingDevice,
          now,
        });

        // 6. refresh token 원문을 생성하고 hash만 세션에 저장한다.
        const refreshToken = this.secureTokenService.createToken();
        // 6. 이후 단계에서 사용할 refreshTokenHash 값을 준비한다.
        const refreshTokenHash = this.hashRefreshToken(refreshToken);
        // 7. 이후 단계에서 사용할 sessionExpiresAt 값을 준비한다.
        const sessionExpiresAt = this.addDays(now, this.getSessionTtlDays());
        // 8. 비동기 결과를 받아 session에 저장한다.
        const session = await this.createOrRotateSession(repository, {
          userId: user.id,
          authDeviceId: device.id,
          refreshTokenHash,
          expiresAt: sessionExpiresAt,
          userAgent: command.userAgent,
          ipAddressHash: command.ipAddress
            ? this.secureTokenService.hash(`ip:${command.ipAddress}`)
            : null,
          now,
        });

        // 7. 생성된 sessionId로 앱 access token을 발급한다.
        const issuedToken = await this.appTokenIssuer.issueAccessToken({
          userId: user.id,
          sessionId: session.id,
        });

        // 8. 클라이언트 응답에 필요한 최신 사용자 정보를 조회한다.
        const me = await repository.getMe(user.id);

        // 11. 조건을 확인해 필요한 분기 처리를 수행한다.
        if (!me) {
          throw new InactiveUserError();
        }

        // 12. 현재 단계에서 필요한 동작을 실행한다.
        this.logEvent("auth.exchange.succeeded", {
          provider: verifiedUser.provider,
        });

        // 9. refresh token과 앱 access token 응답을 반환한다.
        return {
          refreshToken,
          response: createAuthTokenResponse({
            accessToken: issuedToken.accessToken,
            accessTokenExpiresAt: issuedToken.accessTokenExpiresAt,
            user: me,
            device,
          }),
        };
      }
    );

    return {
      refreshToken: transactionResult.refreshToken,
      response: transactionResult.response,
    };
  }

  // 기능 : 외부 인증 토큰을 검증하되 provider 원문 실패를 API 응답에 노출하지 않습니다.
  private async verifyExternalUser(
    externalAuthAccessToken: string
  ): Promise<VerifiedExternalUser> {
    try {
      return await this.externalAuthVerifier.verifyAccessToken(
        externalAuthAccessToken
      );
    } catch {
      this.logEvent("auth.exchange.failed", {
        reason: "provider_verification_failed",
      });
      throw new AuthProviderExchangeFailedError();
    }
  }

  // 기능 : OAuth 계정 존재 여부와 검증 이메일 기준으로 기존 사용자를 갱신하거나 새 사용자를 생성합니다.
  private async syncUser(
    repository: AuthRepository,
    verifiedUser: VerifiedExternalUser,
    email: string,
    now: Date,
    loginMetadata: AuthLoginMetadata
  ): Promise<AuthUserRecord> {
    // 1. 안정적인 provider 계정 ID 또는 legacy 매핑으로 기존 OAuth 계정을 찾는다.
    const oauthAccount = await this.findOrUpgradeOAuthAccount(
      repository,
      verifiedUser,
      now
    );
    // 2. 초기 관리자 allowlist에 포함된 이메일이면 관리자 역할을 부여할 준비를 한다.
    const adminPlatformRole = this.isInitialAdminEmail(email) ? "ADMIN" : undefined;

    // 3. 이미 연결된 OAuth 계정이 있으면 사용자 로그인 메타데이터만 갱신한다.
    if (oauthAccount) {
      const updateInput = {
        userId: oauthAccount.userId,
        email,
        lastLoginLocale: loginMetadata.locale,
        lastLoginCountryCode: loginMetadata.countryCode,
        lastLoginTimeZone: loginMetadata.timeZone,
      };

      if (adminPlatformRole) {
        return repository.updateUserAfterLogin(
          { ...updateInput, platformRole: adminPlatformRole },
          now
        );
      }

      return repository.updateUserAfterLogin(updateInput, now);
    }

    // 4. 동일 이메일의 기존 사용자가 있으면 새 provider 계정을 해당 사용자에 연결한다.
    const existingUser = await repository.findUserByEmail(email);

    if (existingUser) {
      await repository.createOAuthAccountForUser(
        {
          userId: existingUser.id,
          provider: verifiedUser.provider,
          providerUserId: verifiedUser.providerAccountId,
          providerEmail: email,
        },
        now
      );
      this.logEvent("auth.oauthAccount.linked", {
        provider: verifiedUser.provider,
        linkingStrategy: "verified_email",
      });

      const updateInput = {
        userId: existingUser.id,
        email,
        lastLoginLocale: loginMetadata.locale,
        lastLoginCountryCode: loginMetadata.countryCode,
        lastLoginTimeZone: loginMetadata.timeZone,
      };

      if (adminPlatformRole) {
        return repository.updateUserAfterLogin(
          { ...updateInput, platformRole: adminPlatformRole },
          now
        );
      }

      return repository.updateUserAfterLogin(updateInput, now);
    }

    // 5. 기존 계정이 없으면 내부 사용자와 OAuth 계정을 함께 생성한다.
    return repository.createUserWithOAuthAccount(
      {
        email,
        displayName: verifiedUser.name,
        platformRole: adminPlatformRole ?? "USER",
        timeZone: loginMetadata.timeZone,
        preferredLocale: loginMetadata.locale,
        countryCode: loginMetadata.userCountryCode,
        defaultCurrencyCode: loginMetadata.defaultCurrencyCode,
        signupLocale: loginMetadata.locale,
        signupCountryCode: loginMetadata.countryCode,
        signupTimeZone: loginMetadata.timeZone,
        lastLoginLocale: loginMetadata.locale,
        lastLoginCountryCode: loginMetadata.countryCode,
        lastLoginTimeZone: loginMetadata.timeZone,
        provider: verifiedUser.provider,
        providerUserId: verifiedUser.providerAccountId,
        providerEmail: email,
      },
      now
    );
  }

  // 기능 : 안정적인 provider 계정 ID로 OAuth 계정을 찾고, 기존 Supabase user id 기반 매핑은 갱신합니다.
  private async findOrUpgradeOAuthAccount(
    repository: AuthRepository,
    verifiedUser: VerifiedExternalUser,
    now: Date
  ) {
    // 1. 신규 기준인 provider 계정 ID로 기존 OAuth 매핑을 먼저 조회한다.
    const oauthAccount = await repository.findOAuthAccount(
      verifiedUser.provider,
      verifiedUser.providerAccountId
    );

    // 2. 신규 매핑이 있으면 그대로 사용한다.
    if (oauthAccount) {
      return oauthAccount;
    }

    // 3. provider 계정 ID와 auth user id가 같으면 legacy 승격 대상이 아니다.
    if (verifiedUser.authUserId === verifiedUser.providerAccountId) {
      return null;
    }

    // 4. 과거 auth user id로 저장된 OAuth 매핑이 있는지 조회한다.
    const legacyOAuthAccount = await repository.findOAuthAccount(
      verifiedUser.provider,
      verifiedUser.authUserId
    );

    // 5. legacy 매핑도 없으면 신규 계정 생성 흐름으로 넘긴다.
    if (!legacyOAuthAccount) {
      return null;
    }

    // 6. legacy 매핑을 안정적인 provider 계정 ID로 갱신해 다음 로그인부터 신규 기준을 사용한다.
    return repository.updateOAuthAccountProviderUserId(
      legacyOAuthAccount.id,
      verifiedUser.providerAccountId,
      now
    );
  }

  // 기능 : 기기 슬롯의 기존 등록 상태를 확인하고 기기 생성, 갱신, 교체를 처리합니다.
  private async resolveDevice(
    repository: AuthRepository,
    input: {
      readonly user: AuthUserRecord;
      readonly slot: AuthDeviceSlot;
      readonly deviceId: string;
      readonly deviceLabel: string | null;
      readonly replaceExistingDevice: boolean;
      readonly now: Date;
    }
  ): Promise<AuthDeviceRecord> {
    // 1. 원문 device id는 저장하지 않고 hash로만 비교한다.
    const deviceIdHash = this.secureTokenService.hash(`device:${input.deviceId}`);
    // 2. 사용자와 slot 기준으로 현재 활성 기기가 있는지 조회한다.
    const activeDevice = await repository.findActiveDeviceBySlot(
      input.user.id,
      input.slot
    );

    // 3. 해당 slot에 활성 기기가 없으면 새 기기를 등록한다.
    if (!activeDevice) {
      return repository.createAuthDevice({
        userId: input.user.id,
        slot: input.slot,
        deviceIdHash,
        label: input.deviceLabel,
        now: input.now,
      });
    }

    // 4. 같은 브라우저/기기면 마지막 사용 정보만 갱신한다.
    if (activeDevice.deviceIdHash === deviceIdHash) {
      return repository.updateAuthDeviceSeen(
        activeDevice.id,
        input.deviceLabel,
        input.now
      );
    }

    // 5. 다른 기기가 같은 slot을 쓰고 있고 교체 허용이 없으면 충돌로 차단한다.
    if (!input.replaceExistingDevice) {
      throw new DeviceSlotAlreadyRegisteredError();
    }

    // 6. 교체가 허용되면 기존 기기와 그 기기의 활성 세션을 폐기한다.
    await repository.replaceAuthDevice(activeDevice.id, input.now);
    await repository.revokeActiveSessionsByDevice(activeDevice.id, input.now);

    // 7. 새 기기를 활성 기기로 등록한다.
    return repository.createAuthDevice({
      userId: input.user.id,
      slot: input.slot,
      deviceIdHash,
      label: input.deviceLabel,
      now: input.now,
    });
  }

  // 기능 : 같은 기기의 활성 세션은 새 row를 만들지 않고 refresh token만 회전합니다.
  private async createOrRotateSession(
    repository: AuthRepository,
    input: {
      readonly userId: string;
      readonly authDeviceId: string;
      readonly refreshTokenHash: string;
      readonly expiresAt: Date;
      readonly userAgent: string | null;
      readonly ipAddressHash: string | null;
      readonly now: Date;
    }
  ): Promise<AuthSessionRecord> {
    // 1. 같은 기기에 아직 유효한 세션이 있는지 조회한다.
    const activeSession = await repository.findActiveSessionByDevice(
      input.authDeviceId,
      input.now
    );

    // 2. 활성 세션이 있으면 세션 row를 재사용하고 refresh token만 회전한다.
    if (activeSession) {
      await repository.rotateRefreshToken(
        activeSession.id,
        input.refreshTokenHash,
        input.expiresAt,
        input.now
      );

      return {
        ...activeSession,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
      };
    }

    // 3. 활성 세션이 없으면 새 앱 세션을 생성한다.
    return repository.createAuthSession(input);
  }

  // 기능 : 요청 문자열을 인증 기기 슬롯 값으로 검증해 변환합니다.
  private parseDeviceSlot(value: string): AuthDeviceSlot {
    // 1. API 입력값이 지원하는 기기 slot인지 확인한다.
    if (
      value === "mobile" ||
      value === "personal_laptop" ||
      value === "work_laptop"
    ) {
      return value;
    }

    // 2. 지원하지 않는 slot 값은 도메인 오류로 변환한다.
    throw new InvalidDeviceSlotError();
  }

  // 기능 : 기기 식별자의 길이 유효성을 검증합니다.
  private assertDeviceId(deviceId: string): void {
    // 1. 앞뒤 공백을 제거한 실제 식별자 길이를 계산한다.
    const trimmed = deviceId.trim();

    // 2. 너무 짧거나 긴 식별자는 세션 고정 위험을 줄이기 위해 거부한다.
    if (trimmed.length < 8 || trimmed.length > 200) {
      throw new InvalidDeviceIdError();
    }
  }

  // 기능 : 검증 이메일을 소문자 표준 형식으로 정규화하고 빈 값을 차단합니다.
  private normalizeEmail(email: string | null, provider: string): string {
    // 1. provider가 전달한 이메일을 비교 가능한 표준 문자열로 바꾼다.
    const normalized = email?.trim().toLowerCase() ?? "";

    // 2. 이메일이 없으면 계정 연결 기준이 부족하므로 exchange를 거부한다.
    if (normalized.length === 0) {
      this.logEvent("auth.exchange.failed", {
        provider,
        reason: "email_required",
      });
      throw new ExternalUserEmailMissingError(provider);
    }

    // 3. 정규화된 이메일을 이후 사용자 조회와 생성에 사용한다.
    return normalized;
  }

  // 기능 : 서비스가 지원하는 locale 값으로 정규화합니다.
  private normalizeLocale(locale: string | null): string {
    // 1. locale 구분자와 대소문자를 내부 비교 기준으로 정규화한다.
    const normalized = locale?.trim().replace("_", "-").toLowerCase();

    // 2. 값이 없으면 기본 사용자 locale을 사용한다.
    if (!normalized) {
      return DEFAULT_USER_LOCALE;
    }

    // 3. 한국어 locale은 ko-KR로 통일한다.
    if (normalized === "ko" || normalized === "ko-kr") {
      return "ko-KR";
    }

    // 4. 영어 계열 locale은 현재 지원 단위인 en으로 축소한다.
    if (normalized === "en" || normalized.startsWith("en-")) {
      return "en";
    }

    // 5. 지원하지 않는 locale은 기본 사용자 locale로 대체한다.
    return DEFAULT_USER_LOCALE;
  }

  // 기능 : 요청 timeZone을 IANA timezone ID로 정규화하고 없으면 한국 기본값으로 대체합니다.
  private normalizeTimeZone(timeZone: string | null): string {
    // 1. timeZone 입력의 공백을 제거한다.
    const normalized = timeZone?.trim();

    // 2. 값이 없거나 IANA timezone이 아니면 기본 시간대를 사용한다.
    if (!normalized || !isValidIanaTimeZone(normalized)) {
      return DEFAULT_USER_TIME_ZONE;
    }

    // 3. 유효한 IANA timezone이면 사용자 메타데이터에 그대로 반영한다.
    return normalized;
  }

  // 기능 : 프록시가 전달한 접속 국가 코드를 ISO 3166-1 alpha-2 형태로 정규화합니다.
  private normalizeCountryCode(countryCode: string | null): string | null {
    // 1. 프록시 헤더의 국가 코드를 대문자 두 글자 후보로 만든다.
    const normalized = countryCode?.trim().toUpperCase();

    // 2. 국가 코드 형식이 아니면 저장하지 않는다.
    if (!normalized || normalized.length !== 2) {
      return null;
    }

    // 3. 알파벳 두 글자만 국가 코드로 인정한다.
    return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
  }

  // 기능 : 접속 국가를 사용자 기본 국가 지원 범위로 축소합니다.
  private resolveUserCountryCode(countryCode: string | null): string {
    // 1. 현재 지원하는 해외 기본 국가는 미국만 별도로 유지한다.
    return countryCode === "US" ? "US" : DEFAULT_USER_COUNTRY_CODE;
  }

  // 기능 : 사용자 기본 국가에 맞는 1차 지원 통화를 선택합니다.
  private resolveDefaultCurrencyCode(countryCode: string): string {
    // 1. 미국 사용자는 USD, 그 외 사용자는 기본 KRW를 사용한다.
    return countryCode === "US" ? "USD" : DEFAULT_USER_CURRENCY_CODE;
  }

  // 기능 : 사용자 상태가 로그인 가능한 활성 상태인지 검증합니다.
  private assertActiveUser(user: AuthUserRecord): void {
    // 1. 비활성, 정지, 삭제 사용자는 세션 발급을 차단한다.
    if (user.status !== "ACTIVE" || user.deletedAt) {
      throw new InactiveUserError();
    }
  }

  // 기능 : 저장용 refresh token 해시 값을 생성합니다.
  private hashRefreshToken(refreshToken: string): string {
    // 1. refresh token 원문에 용도 prefix를 붙여 hash namespace를 분리한다.
    return this.secureTokenService.hash(`refresh:${refreshToken}`);
  }

  // 기능 : 초기 관리자 이메일 목록에 포함되는지 확인합니다.
  private isInitialAdminEmail(email: string): boolean {
    // 1. 정규화된 초기 관리자 이메일 목록에서 로그인 이메일을 찾는다.
    return this.getInitialAdminEmails().includes(email);
  }

  // 기능 : 환경 변수에서 초기 관리자 이메일 목록을 읽어 정규화합니다.
  private getInitialAdminEmails(): string[] {
    // 1. 쉼표로 구분된 초기 관리자 이메일 환경 변수를 읽는다.
    const value = this.configService.get<string>("INITIAL_ADMIN_EMAILS") ?? "";

    // 2. 공백과 대소문자를 정리하고 빈 항목을 제거한다.
    return value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);
  }

  // 기능 : 세션 만료 기간 설정값을 일 단위 숫자로 반환합니다.
  private getSessionTtlDays(): number {
    // 1. 환경 변수에서 세션 TTL 일수를 읽고 숫자로 변환한다.
    const value = Number(
      this.configService.get<string>("APP_SESSION_TTL_DAYS") ?? "7"
    );

    // 2. 유효한 양수만 사용하고 잘못된 값은 7일로 대체한다.
    return Number.isFinite(value) && value > 0 ? value : 7;
  }

  // 기능 : 기준 날짜에 지정한 일수를 더한 날짜를 반환합니다.
  private addDays(date: Date, days: number): Date {
    // 1. Date 원본을 변경하지 않고 millisecond 기준으로 새 만료 시각을 만든다.
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  // 기능 : 인증 exchange 이벤트를 token/email/raw provider 오류 없이 구조화해 기록합니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    // 1. 민감정보를 제외한 필드만 JSON 구조화 로그로 남긴다.
    this.logger?.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "ExchangeExternalAuthTokenUseCase"
    );
  }
}
