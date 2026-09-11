import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/infrastructure/auth.module";
import { ErrorReportModule } from "./modules/error-report/infrastructure/error-report.module";
import { HealthModule } from "./modules/health/infrastructure/health.module";
import { PublicContactRequestModule } from "./modules/public-contact-request/infrastructure/public-contact-request.module";
import { SupportRequestModule } from "./modules/support-request/infrastructure/support-request.module";
import { UserModule } from "./modules/user/infrastructure/user.module";
import { RequestIdMiddleware } from "./shared/presentation/middleware/request-id.middleware";

// 역할 : AppModule 애플리케이션의 루트 모듈 의존성을 조립합니다.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // bootstrap 예외 로더와 같은 local env 파일 우선순위를 ConfigModule에도 적용한다.
      envFilePath: [".env.local", ".env"],
    }),
    HealthModule,
    AuthModule,
    UserModule,
    PublicContactRequestModule,
    ErrorReportModule,
    SupportRequestModule,
  ],
})
export class AppModule implements NestModule {
  // 기능 : 모든 HTTP 요청에 request id middleware를 적용합니다.
  configure(consumer: MiddlewareConsumer): void {
    // 1. 모든 route에 request id를 부여한다.
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
