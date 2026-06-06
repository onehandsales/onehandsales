import { Module } from "@nestjs/common";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";
import { CURRENT_USER_RESOLVER } from "@/shared/application/ports/current-user-resolver.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SupabaseInfrastructureModule } from "@/shared/infrastructure/supabase/supabase-infrastructure.module";
import { AUTH_REPOSITORY } from "./application/ports/auth.repository";
import { APP_TOKEN_ISSUER } from "./application/ports/app-token.port";
import { SECURE_TOKEN_SERVICE } from "./application/ports/secure-token.port";
import { ExchangeExternalAuthTokenUseCase } from "./application/use-cases/exchange-external-auth-token.use-case";
import { GetMeUseCase } from "./application/use-cases/get-me.use-case";
import { ListAuthProvidersUseCase } from "./application/use-cases/list-auth-providers.use-case";
import { LogoutUseCase } from "./application/use-cases/logout.use-case";
import { RefreshAppTokenUseCase } from "./application/use-cases/refresh-app-token.use-case";
import { ResolveCurrentUserUseCase } from "./application/use-cases/resolve-current-user.use-case";
import { PrismaAuthRepository } from "./infrastructure/persistence/prisma-auth.repository";
import { JoseAppTokenIssuerAdapter } from "./infrastructure/security/jose-app-token-issuer.adapter";
import { NodeSecureTokenService } from "./infrastructure/security/node-secure-token.service";
import { AuthCookieService } from "./presentation/http/auth-cookie.service";
import { AuthController } from "./presentation/http/auth.controller";
import { AdminMeController, MeController } from "./presentation/http/me.controller";

@Module({
  imports: [PrismaInfrastructureModule, SupabaseInfrastructureModule],
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
    AuthGuard,
    AdminGuard,
    {
      provide: AUTH_REPOSITORY,
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
