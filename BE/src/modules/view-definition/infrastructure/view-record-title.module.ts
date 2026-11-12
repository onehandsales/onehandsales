import { Module } from "@nestjs/common";
import { VIEW_DATA_CONFIGURATION_QUERY } from "../application/ports/view-data-configuration-query.port";
import { PrismaViewDataConfigurationQueryRepository } from "./persistence/prisma-view-data-configuration-query.repository";
// 역할 : 다른 모듈이 제목 표시 정의를 순환 의존 없이 읽도록 공개 port를 조립합니다.
@Module({ providers: [{ provide: VIEW_DATA_CONFIGURATION_QUERY, useClass: PrismaViewDataConfigurationQueryRepository }], exports: [VIEW_DATA_CONFIGURATION_QUERY] })
export class ViewRecordTitleModule {}
