import { Module } from "@nestjs/common";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { AnalyticsRecorderModule } from "@/modules/analytics/infrastructure/analytics-recorder.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SupabaseInfrastructureModule } from "@/shared/infrastructure/supabase/supabase-infrastructure.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { AUTH_REPOSITORY } from "../application/ports/auth.repository";
import { APP_TOKEN_ISSUER } from "../application/ports/app-token.port";
import { SECURE_TOKEN_SERVICE } from "../application/ports/secure-token.port";
import { ExchangeExternalAuthTokenUseCase } from "../application/use-cases/exchange-external-auth-token.use-case";
import { GetMeUseCase } from "../application/use-cases/get-me.use-case";
import { ListAuthProvidersUseCase } from "../application/use-cases/list-auth-providers.use-case";
import { LogoutUseCase } from "../application/use-cases/logout.use-case";
import { RefreshAppTokenUseCase } from "../application/use-cases/refresh-app-token.use-case";
import { ResolveCurrentUserUseCase } from "../application/use-cases/resolve-current-user.use-case";
import { AuthCookieService } from "../presentation/http/auth-cookie.service";
import { AuthController } from "../presentation/http/auth.controller";
import { AdminMeController, MeController } from "../presentation/http/me.controller";
import { PrismaAuthRepository } from "./persistence/prisma-auth.repository";
import { JoseAppTokenIssuerAdapter } from "./security/jose-app-token-issuer.adapter";
import { NodeSecureTokenService } from "./security/node-secure-token.service";

// 역할 : AuthModule 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [
    AnalyticsRecorderModule,
    PrismaInfrastructureModule,
    SupabaseInfrastructureModule,
  ],
  controllers: [AuthController, MeController, AdminMeController],
  providers: [
    ListAuthProvidersUseCase,
    ExchangeExternalAuthTokenUseCase,
    RefreshAppTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    ResolveCurrentUserUseCase,
    JoseAppTokenIssuerAdapter,
    NodeSecureTokenService,
    AuthCookieService,
    AppLogger,
    AuthGuard,
    AdminGuard,
    {
      provide: AUTH_REPOSITORY,
      // 기능 : Prisma 서비스로 인증 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAuthRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: APP_TOKEN_ISSUER,
      useExisting: JoseAppTokenIssuerAdapter,
    },
    {
      provide: SECURE_TOKEN_SERVICE,
      useExisting: NodeSecureTokenService,
    },
    {
      provide: CURRENT_USER_RESOLVER,
      useExisting: ResolveCurrentUserUseCase,
    },
  ],
  exports: [AuthGuard, AdminGuard, AuthCookieService, CURRENT_USER_RESOLVER],
})
export class AuthModule {}
