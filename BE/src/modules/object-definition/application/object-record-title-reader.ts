import { Inject, Injectable } from "@nestjs/common";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY, type AttributeDefinitionMetadataQuery } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { ObjectRecordTitleQuery } from "./ports/object-record-title-query.port";
import { OBJECT_RECORD_TITLE_REPOSITORY, type ObjectRecordTitleRepository } from "./ports/object-record-title.repository";

// 역할 : Object의 대표 포인터와 속성 소유 모듈의 메타데이터를 조합합니다.
@Injectable()
export class ObjectRecordTitleReader implements ObjectRecordTitleQuery {
  // 기능 : 소유 저장소와 다른 모듈의 공개 읽기 port만 주입받습니다.
  constructor(
    @Inject(OBJECT_RECORD_TITLE_REPOSITORY) private readonly objects: ObjectRecordTitleRepository,
    @Inject(ATTRIBUTE_DEFINITION_METADATA_QUERY) private readonly metadata: AttributeDefinitionMetadataQuery,
  ) {}

  // 기능 : 같은 Workspace/Object의 표현 가능한 이름 속성만 공개합니다.
  async titles(workspaceId: string, context: TransactionContext) {
    // 1. 두 모듈을 같은 snapshot/transaction에서 읽는다.
    const pointers = await this.objects.titles(workspaceId, context);
    const ids = [...new Set(pointers.map(row => row.attributeDefinitionId))];
    if (ids.length === 0) return [];
    const attributes = new Map((await this.metadata.findAttributes(workspaceId, ids, context)).map(row => [row.id, row]));
    // 2. 삭제된 속성·다른 소속·지원하지 않는 타입을 이름으로 사용하지 않는다.
    return pointers.filter(row => {
      const attribute = attributes.get(row.attributeDefinitionId);
      return attribute?.workspaceId === workspaceId && attribute.objectDefinitionId === row.objectDefinitionId
        && attribute.listDefinitionId === null && ["Text", "PersonalName"].includes(attribute.type);
    });
  }
}
