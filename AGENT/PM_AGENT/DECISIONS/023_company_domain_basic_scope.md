# 고정형 고객사 도메인 제거 결정

Date: 2026-09-10
Updated: 2026-09-12
Status: Historical removal record / current boundary

## 1. 결정

기존 고정형 고객사 관리 도메인은 현재 런타임 범위에서 제거됐다.

이 문서는 과거 결정을 활성 기준으로 설명하지 않고, 제거된 범위를 식별하기 위한 기록으로만 유지한다.

## 2. 현재 런타임에 없는 범위

- 고정형 고객사 목록/상세/생성/수정 화면
- 고정형 고객사 검색
- 고정형 고객사 xlsx export
- 고객사 분야/지역 옵션 API
- 고객사 전용 Prisma 모델과 relation

## 3. 현재 유지되는 범위

- Auth/User
- Error Report
- Support Request
- Public Contact Request
- Health
- Admin 권한 확인

공개 문의의 회사명과 회사 규모 입력 필드는 도메인 record가 아니라 문의 접수 원문의 일부이므로 유지한다.

## 4. 용어 예외

`회사`, `고객사`, `Company`라는 단어가 항상 금지되는 것은 아니다.

허용되는 경우:

- 공개 문의에서 문의자가 입력한 회사명/회사 규모
- 특정 직군 Kit 안의 업무 언어
- 과거 제거 범위를 설명하는 문맥

금지되는 경우:

- OneHand CRM 전체의 전역 기본 도메인으로 Company를 되살리는 설명
- 현재 활성 Prisma 모델 또는 API처럼 Company record를 설명하는 문서
- 모든 Kit이 Company를 중심으로 돌아가야 한다는 전제

## 5. 후속 방향

다음 CRM 코어는 기존 고정형 테이블을 되살리지 않고 Workspace/Kit/Object/Attribute/Relationship/Record/View 기반으로 별도 설계한다.

## 6. 관련 문서

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
