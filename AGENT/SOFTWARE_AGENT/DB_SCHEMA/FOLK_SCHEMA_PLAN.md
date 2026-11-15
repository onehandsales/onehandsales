# folk 전환 DB 설계안

Status: Proposed — 실제 schema / migration 미변경
Date: 2026-11-15

이 문서는 folk 공개 기능을 재현하기 위한 **우리 구현안**이다. folk의 비공개 테이블 구조를 알아낸 문서가 아니다. [PM 결정](../../PM_AGENT/DECISIONS/036_folk_benchmark_transition.md)과 [공식 근거·미확인 항목](../../UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md)을 함께 읽는다.

## 1. 현재 구조

실제 정본은 [schema.prisma](../../../BE/prisma/schema.prisma)다. 현재 32개 모델이며 이름에 Definition이 붙은 CRM 코어가 실행 중이다.

```text
User ─ OAuthAccount / AuthDevice / AuthSession
  └ WorkspaceMember ─ Workspace
                       ├ Team ─ TeamMember
                       ├ Actor (작성·수정 주체)
                       ├ ObjectDefinition
                       │   ├ AttributeDefinition ─ SelectOption / StatusOption
                       │   └ RecordDefinition ─ RecordAttributeValueDefinition
                       ├ ListDefinition
                       │   ├ AttributeDefinition
                       │   └ ListEntryDefinition ─ ListEntryValueDefinition
                       │              └ RecordDefinition
                       └ ViewDefinition (Object 또는 List를 소스로 사용)
                           ├ 표시 필드 / 필터 트리 / 정렬
                           ├ 그룹 / 그룹별 표시 설정
                           ├ Widget / WorkDependency
                           └ Favorite
RelationshipDefinition은 범용 객체 관계 정의를 담당한다.
ErrorReport / SupportRequest / PublicContactRequest는 별도 지원 접수다.
```

Attribute는 Object 또는 List 범위를 가지며, 값은 타입별 컬럼과 관계 참조를 사용하는 범용 모델이다. 단순한 고객 테이블 몇 개가 아니라 사용자 정의 CRM 구조를 표현하는 엔진에 가깝다.

## 2. 목표 관계 제안

```text
Workspace
├ Membership / Team / 권한·감사 주체
├ Person ─┬ ContactPoint (이메일·전화·주소 등)
│         └ PersonCompany ─ Company
├ Group
│  ├ GroupMember / 접근 정책
│  ├ GroupPerson ─ Person (여러 그룹에서 같은 사람 참조)
│  ├ GroupCompany ─ Company
│  ├ ObjectType ─ CustomObject (Deals 등, 해당 그룹 범위)
│  │                └ ObjectPerson / ObjectCompany
│  ├ CustomField ─ FieldOption
│  │                └ CustomFieldValue
│  └ View (대상: People / Companies / 특정 ObjectType)
│       └ Table 또는 Pipeline 설정
├ Note / Comment / Attachment ─ 대상 레코드
├ Task / Assignee ─ 대상 레코드
├ Interaction / IntegrationAccount / SyncCursor
└ Dashboard / Chart, Campaign 등 후속 기능별 모델
```

위 이름은 후보이며 최종 Prisma 모델 목록이 아니다. 객체 탭을 별도 테이블로 저장할지 View의 대상 정보에서 구성할지도 화면 조사 후 결정한다. 회사 소속 이력, 개인정보 등 사용자 초기 아이디어는 folk 동등성 요구와 별도로 검토한다.

**단순화의 중심**은 People/Companies 기본 정보를 고정하고 Group별 확장으로 동적 범위를 제한하는 것이다. CustomObject와 CustomField까지 없애면 최종 목표를 충족하지 못한다. Deals는 그룹의 객체 타입 예시이며 제품 전체의 유일한 고정 거래 테이블로 확정하지 않는다.

## 3. 현재 32개 모델별 처리 방향

“대체”는 새 계약·데이터 이동·참조 제거 이후의 계획이다. 지금 DROP한다는 뜻이 아니다.

| 현재 모델 | 방향 | 이유/대상 |
| --- | --- | --- |
| User | 유지 | 계정 기반 |
| UserOAuthAccount | 유지 | 로그인 provider 연결 |
| AuthDevice | 유지 | 기기 관리 |
| AuthSession | 유지 | 세션·로그아웃 |
| Workspace | 유지·조정 | 데이터 경계; folk 생성/전환 정책 대조 |
| WorkspaceMember | 유지·조정 | Workspace 역할·멤버십 |
| Team | 유지·재검토 | 현재 foundation 보존; folk 공유 의미와 일치 여부 별도 확인 |
| TeamMember | 유지·재검토 | Team과 함께 판단 |
| Actor | 유지·재검토 | 기존 감사·작성 주체; 불필요하다고 단정하지 않음 |
| ErrorReport | 유지 | 오류 접수 |
| SupportRequest | 유지 | 지원 접수 |
| PublicContactRequest | 유지 | 공개 문의, CRM Company와 다른 책임 |
| ObjectDefinition | 축소·대체 | People/Companies 고정 기반 + 그룹 ObjectType |
| RecordDefinition | 대체 | Person/Company/CustomObject로 의미 분리 |
| RecordAttributeValueDefinition | 대체 | 기본 컬럼과 그룹별 확장 값 분리 |
| ListDefinition | 대체 | Group의 포함·필드·공유 계약 |
| ListEntryDefinition | 대체 | GroupPerson/GroupCompany; 객체는 그룹 소속 |
| ListEntryValueDefinition | 대체 | 그룹별 CustomFieldValue |
| AttributeDefinition | 축소·대체 | 기본 필드 카탈로그 + 범위 제한된 CustomField |
| SelectOption | 통합 검토 | 단일·다중 선택 FieldOption |
| StatusOption | 통합 검토 | Pipeline의 선택 필드 옵션; 별도 상태 엔진 필요성 검토 |
| RelationshipDefinition | 축소·대체 | 명시적 소속/객체 연결 + 필요한 사용자 관계 필드 |
| ViewDefinition | 재설계 | Group·대상 타입·Table/Pipeline 및 저장 방식 |
| ViewAttributeSettingDefinition | 재설계 | 컬럼/카드 표시 순서·숨김 |
| ViewFilterGroupDefinition | 통합 검토 | View의 필터 AST 또는 정규화 모델 |
| ViewFilterConditionDefinition | 통합 검토 | 필터 연산 검증·참조 무결성 유지 |
| ViewSortDefinition | 통합 검토 | View 정렬 설정 |
| ViewGroupDefinition | 통합 검토 | Pipeline 분류 필드 |
| ViewGroupSettingDefinition | 통합 검토 | 열 순서·숨김·표시 설정 |
| ViewWidgetDefinition | 재설계 | Dashboard/Chart 기능에 대응; 기능 삭제 아님 |
| ViewWorkDependencyDefinition | 제거 후보 | 현재 Gantt 의존성 표현; folk 조사에 대응 흐름이 없으면 제거 |
| ViewFavoriteDefinition | 재설계 검토 | 사이드바 개인화/즐겨찾기 조사 후 범위 결정 |

## 4. 저장 방식의 선택 기준

- 기본 정보는 Person/Company의 명시적 컬럼과 연락수단·소속 연결 테이블로 표현한다.
- 사용자 필드는 정의와 값을 분리한다. 타입 검증, 정렬, 필터, 인덱스 요구를 비교해 typed value/JSONB/참조 연결을 정한다.
- View 설정을 JSONB로 합치는 안은 후보일 뿐이다. 필드 삭제 시 깨진 참조 제거, 설정 버전, 필터 검증, 동시 편집을 해결해야 한다.
- 화면의 객체 탭과 Pipeline 열은 별개의 개념이다. UI의 모든 요소를 1:1 테이블로 만들지 않는다.
- 다형 대상 링크는 무검증 `type + id`만 저장하지 않는다. 공통 record identity, 명시적 연결 테이블 또는 FK와 CHECK 조합을 비교한다.
- 모든 연결은 Workspace가 같아야 한다. 그룹 필드 값은 해당 그룹·대상 타입·멤버십과 일치해야 한다.
- 동일 사람의 기본 정보는 여러 그룹에서 공유되지만 그룹별 필드 값은 격리한다.
- 그룹 객체는 해당 그룹 범위의 타입과 값을 가진다. 공개 API는 객체 필드 타입에도 제한을 두므로 현재 17종 Attribute를 모든 대상에 그대로 허용하지 않는다. 구체 제한은 근거 F11과 실제 UI를 대조한다.
- Tasks의 날짜·시간·반복은 Workspace timezone 의미를 확인한다. 현재 User.timeZone을 모든 기한 판단에 그대로 재사용하지 않는다.
- 메모·작업의 공개/비공개와 그룹 삭제 후 보존은 공식 문서 충돌이 있어 실측 전 cascade를 확정하지 않는다.

## 5. 제거·이전 절차

1. 화면별 데이터 읽기/쓰기와 기존 API 의존을 확정한다.
2. 기존 DB의 환경·실제 데이터·보존 요구를 확인한다. 이 문서 작업에서는 원격 DB를 조회하지 않았다.
3. 데이터 이전 여부를 정한다. 필요하면 구 ID→새 ID 매핑과 참조/값 변환을 설계한다.
4. 새 schema와 API, UI를 검증 가능한 단위로 작성한다.
5. 기본 정보·그룹 값·옵션·관계·View 설정의 전후 건수와 내용을 검증한다.
6. 이전 API/FE/seed/fixture 참조를 제거한 후 사용하지 않는 테이블·enum을 제거한다.
7. 배포 중 호환성, rollback 또는 백업 복구 경로를 검증한다.

현재 migration에는 Prisma만으로 충분히 표현되지 않는 복합 FK, CHECK, deferrable 제약 등이 있다. [현재 SQL 이력](CRM_CORE_SCHEMA_DRAFT.md)을 보존하고 새 migration에서 대체 관계를 확인한다. 과거 migration을 지워 적용 이력을 다시 쓰지 않는다.

## 6. 아직 확정하지 않은 것

최종 테이블 수, CustomFieldValue 저장 방식, UI 자동 저장의 충돌 계약, 실제 folk 역할 매핑, 그룹·레코드 삭제/복구, Dashboard 구조, 과거 데이터 이전 여부, 외부 연동의 보존·동기화 정책.

API와 FE 전환 영향은 [FOLK_TRANSITION_MATRIX](../COMMON/FOLK_TRANSITION_MATRIX.md)를 따른다.
