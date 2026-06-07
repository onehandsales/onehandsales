import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { BusinessCardModule } from "./modules/business-card/business-card.module";
import { CompanyModule } from "./modules/company/company.module";
import { ContactModule } from "./modules/contact/contact.module";
import { DealModule } from "./modules/deal/deal.module";
import { HealthModule } from "./modules/health/health.module";
import { ImportExportModule } from "./modules/import-export/import-export.module";
import { MeetingNoteModule } from "./modules/meeting-note/meeting-note.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { ProductModule } from "./modules/product/product.module";
import { ScheduleModule } from "./modules/schedule/schedule.module";
import { TrashModule } from "./modules/trash/trash.module";
import { UserModule } from "./modules/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    HealthModule,
    AuthModule,
    BusinessCardModule,
    UserModule,
    CompanyModule,
    ContactModule,
    ProductModule,
    DealModule,
    ScheduleModule,
    MeetingNoteModule,
    ImportExportModule,
    NotificationModule,
    TrashModule,
  ],
})
export class AppModule {}
