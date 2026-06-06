import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { CompanyModule } from "./modules/company/company.module";
import { ContactModule } from "./modules/contact/contact.module";
import { DealModule } from "./modules/deal/deal.module";
import { HealthModule } from "./modules/health/health.module";
import { ProductModule } from "./modules/product/product.module";
import { UserModule } from "./modules/user/user.module";

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
  ],
})
export class AppModule {}
