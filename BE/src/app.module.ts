import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/infrastructure/auth.module";
import { CompanyModule } from "./modules/company/infrastructure/company.module";
import { ContactModule } from "./modules/contact/infrastructure/contact.module";
import { DealModule } from "./modules/deal/infrastructure/deal.module";
import { HealthModule } from "./modules/health/infrastructure/health.module";
import { ProductModule } from "./modules/product/infrastructure/product.module";
import { ScheduleModule } from "./modules/schedule/infrastructure/schedule.module";
import { UserModule } from "./modules/user/infrastructure/user.module";
import { RequestIdMiddleware } from "./shared/presentation/middleware/request-id.middleware";

// 역할 : AppModule 애플리케이션의 루트 모듈 의존성을 조립합니다.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    HealthModule,
    AuthModule,
    UserModule,
    CompanyModule,
    ContactModule,
    ProductModule,
    DealModule,
    ScheduleModule,
  ],
})
export class AppModule implements NestModule {
  // 기능 : 모든 HTTP 요청에 request id middleware를 적용합니다.
  configure(consumer: MiddlewareConsumer): void {
    // 1. 모든 route에 request id를 부여한다.
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
