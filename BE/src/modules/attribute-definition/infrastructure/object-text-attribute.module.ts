import { Module } from "@nestjs/common";
import { OBJECT_TEXT_ATTRIBUTE_CREATOR } from "@/modules/attribute-definition/application/ports/object-text-attribute-creator.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaObjectTextAttributeCreator } from "./persistence/prisma-object-text-attribute-creator";

// 역할 : Object 초기화용 포트만 공개해 Attribute HTTP 모듈의 역방향 의존성을 피합니다.
@Module({
  imports: [PrismaInfrastructureModule],
  providers: [{ provide: OBJECT_TEXT_ATTRIBUTE_CREATOR, useClass: PrismaObjectTextAttributeCreator }],
  exports: [OBJECT_TEXT_ATTRIBUTE_CREATOR],
})
export class ObjectTextAttributeModule {}
