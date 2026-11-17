# Bonsai 전환 DB 설계안

Status: Proposed / schema·migration·DB 미변경
Updated: 2026-11-17

이 문서는 Bonsai의 공개 기능을 구현하기 위한 **우리 설계 후보**다. 비공개 DB 구조를 확인한 결과가 아니다. [PM 결정](../../PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md), [제품 개념](../../PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md), [공식 근거](../../UXUI_AGENT/PLANNING/BONSAI_BENCHMARK_RESEARCH.md)를 함께 읽는다.

## 1. 현재와 전환 원칙

2026-11-15 구현 기록의 32개 모델은 인증·계정·Workspace/Team/Actor, 범용 Object/Attribute/Record·List/Entry·View, 지원 접수로 구성된다. 정본 파일은 [schema.prisma](../../../BE/prisma/schema.prisma)이며 이번 작업에서는 실행 코드나 실제 DB를 재검증하지 않았다.

인증·사용자·Workspace를 유지 검토의 출발점으로 삼되 기존 CRM 엔진 보존 자체를 목표로 하지 않는다. Bonsai 기능·화면·권한에 맞춰 대체한다. UI 이름만 바꾸거나 현행 엔진에 맞춰 제품 범위를 줄이지 않는다.

## 2. 업무 모델 후보

| 경계 | 모델 후보·책임 | 설계에서 확인할 것 |
| --- | --- | --- |
| 계정·권한 | Workspace, Membership, Role/Permission, 감사 주체 | 계정 조직과 고객 회사의 분리, 멤버·프로젝트·재무 접근 |
| 고객·영업 | Client/Company, Contact, Deal, Stage, Note/Activity | 개인 고객·연락 담당자·거래의 관계와 공유 |
| 견적 | Service, RateCard, Estimate, Section, Item | 수량·단가·원가·할인·통화·계산·버전 |
| 합의 문서 | Document, Revision/Snapshot, Recipient, Signature | 발송·서명 후 변경, 원본 견적과 연결·복사 |
| 수행 | Project, Task, TaskDependency, Allocation, TimeEntry | 거래 연결, 하위 작업·반복·기한·배정·시간 |
| 비용·청구 | Budget, Expense, Invoice, InvoiceItem, PaymentRecord | 청구 가능/미청구/청구됨, 부분 입금·잔액·취소·중복 |
| 고객 포털 | PortalAccess, Share, File/Comment | 고객별 접근과 내부 정보 비공개 |
| 확장 | CustomField/Value, ModuleView, Automation, Integration, Report | 지원 대상·유형·공유·저장 방식·외부 이벤트 |

이름·테이블 수·카디널리티는 미확정이다. 모든 UI 탭을 테이블로 만들지 않는다. Project의 과금 방식, 고객 청구의 반복/구독, OneHand 이용료 결제는 다른 책임이다. 고정 업무 모델과 사용자 필드·보기의 동적 설정을 필요한 범위에서 조합한다.

## 3. 기존 32개 모델 처리 후보

아래는 기존 구현 기록과 대조할 후보이며 실행할 삭제 목록이 아니다.

| 기존 모델 | 후보 | 확인할 책임 |
| --- | --- | --- |
| User | 유지 검토 | 계정·프로필 |
| UserOAuthAccount | 유지 검토 | 로그인 연결 |
| AuthDevice | 유지 검토 | 기기·슬롯 |
| AuthSession | 유지 검토 | 세션·회전·로그아웃 |
| Workspace | 유지·조정 검토 | 테넌트 경계와 계정 조직 |
| WorkspaceMember | 유지·조정 검토 | 멤버십·역할 |
| Team | 유지·재설계 검토 | 팀·프로젝트 접근·인력 배정 |
| TeamMember | 유지·재설계 검토 | 팀 소속과 권한 |
| Actor | 유지·재설계 검토 | 작성·수정·감사 주체 |
| ErrorReport | 유지 검토 | 오류 접수 |
| SupportRequest | 유지 검토 | 사용자 지원 |
| PublicContactRequest | 유지 검토 | 공개 문의; 고객 CRM과 별개 |
| ObjectDefinition | 교체 검토 | 고객·거래·프로젝트 등의 업무 모델 |
| RecordDefinition | 교체 검토 | 업무별 레코드와 식별자 |
| RecordAttributeValueDefinition | 교체 검토 | 명시적 값과 지원 대상별 사용자 필드 |
| ListDefinition | 교체·재설계 검토 | 업무별 목록·분류와 조회 |
| ListEntryDefinition | 교체·재설계 검토 | 업무 관계; 그룹 멤버십으로 자동 매핑하지 않음 |
| ListEntryValueDefinition | 교체·재설계 검토 | 관계별 데이터 필요성 확인 |
| AttributeDefinition | 재설계 검토 | Custom fields 지원 대상·유형 |
| SelectOption | 재설계 검토 | 사용자 필드 선택 옵션 |
| StatusOption | 재설계 검토 | 거래·작업·문서·청구의 서로 다른 상태 |
| RelationshipDefinition | 교체·재설계 검토 | 업무별 명시적 관계와 필요한 확장 |
| ViewDefinition | 재설계 검토 | 모듈별 Custom views·공유·기본 보기 |
| ViewAttributeSettingDefinition | 재설계 검토 | 열·카드 표시 설정 |
| ViewFilterGroupDefinition | 재설계 검토 | 필터 조합과 검증 |
| ViewFilterConditionDefinition | 재설계 검토 | 유형별 연산·값·참조 |
| ViewSortDefinition | 재설계 검토 | 모듈별 정렬 |
| ViewGroupDefinition | 재설계 검토 | 작업 보드·거래 단계·그룹화 |
| ViewGroupSettingDefinition | 재설계 검토 | 그룹별 표시·순서 |
| ViewWidgetDefinition | 재설계 검토 | 업무·재무 보고서; 테이블만으로 구현 완료 아님 |
| ViewWorkDependencyDefinition | 유지·재설계 검토 | 작업 의존·Gantt 요구 조사; 선제 제거하지 않음 |
| ViewFavoriteDefinition | 재설계 검토 | 개인화·즐겨찾기 실제 화면 확인 |

## 4. 계약·무결성

- Workspace 소유와 고객·프로젝트·문서·청구의 참조 범위를 DB·application 양쪽에서 검증한다.
- 견적 원본, 발송 문서, 청구 항목에 어떤 값을 복사·보존·갱신하는지 정한다. 전역 자동 동기화를 가정하지 않는다.
- 돈은 통화·정밀도·반올림·세금/할인 순서·입금 합계·잔액 불변식을 계약으로 정의한다. 일반 float로 계산을 확정하지 않는다.
- 업무 날짜와 시점을 구분하고 반복·예약·청구 주기의 기준 시간대를 정한다.
- 발송·서명·결제/입금·외부 이벤트의 중복 처리와 재시도, 부분 실패, 상태 전이를 정한다.
- 고객 포털은 데이터의 별도 사본보다 접근 정책과 공개 snapshot 필요성을 검토한다.
- 삭제·보관·취소·연결 해제·이력 보존은 기능별로 정한다. 임의 cascade나 법적 보존 기간을 설정하지 않는다.
- 사용자 필드·보기의 typed value/JSONB/정규화 선택은 필터·정렬·참조·인덱스·동시 편집 요구로 판단한다.
- 기존 migration SQL의 복합 FK·CHECK·deferrable·컬럼별 SET NULL을 읽고 대체 관계를 검증한다. Prisma 선언만으로 전체 제약을 이해했다고 보지 않는다.

## 5. 전환 순서

1. 공식 자료·Gummble·실계정의 확인 상태를 기록하며 화면과 업무 동작을 정리한다.
2. 기능 단위 mock과 API·DB·권한·계산·상태 계약을 연결한다.
3. 기존 API/FE/port/repository/seed/fixture 의존을 확인한다.
4. 대상 환경·보존 요구를 확인하고 필요한 ID·값·관계 이전안을 설계한다.
5. 새 DB/API/FE를 같은 기능 단위로 구현·검증한다.
6. 이전 전후 관계·금액·건수·권한을 검증하고 참조가 사라진 구조를 제거한다.
7. 배포 호환성·복구 경로를 검증한다. 과거 migration 이력을 지워 재작성하지 않는다.

DB 접속·초기화·삭제는 이번 문서 변경에 포함되지 않는다. [전환 영향](../COMMON/BONSAI_TRANSITION_MATRIX.md)을 따르며 기존 [SQL 이력](CRM_CORE_SCHEMA_DRAFT.md)은 당시 적용 기록으로 보존한다.

## 6. 미확정

최종 모델 수·테이블명·카디널리티, 필드별 API 계약, 권한 프로필 매핑, 문서 snapshot과 서명 보존, 금액/세금 계산, 시간대·반복 규칙, 실제 결제 제공자, 데이터 이전/초기화 여부, 배포 환경·순서.
