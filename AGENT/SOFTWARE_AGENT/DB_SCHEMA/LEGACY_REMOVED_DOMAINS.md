# Legacy Removed Domains

Status: Removed Domain Record
Date: 2026-09-13

## 1. 목적

이 문서는 OneHand CRM 전환 전 존재했거나 계획됐던 고정형 도메인 schema 문서를 하나로 모은 제거 기록이다.

아래 도메인은 현재 `BE/prisma/schema.prisma`, Backend module, User Web 활성 route의 정본 범위가 아니다.

## 2. 제거 또는 비활성 도메인

| 과거 도메인 | 현재 상태 |
| --- | --- |
| Company | 고정형 고객사 record 모델 없음 |
| Contact | 담당자 record 모델 없음 |
| Product | 상품 record 모델 없음 |
| Deal | 딜 record 모델 없음 |
| Business Card | 명함 schema 없음 |
| Data Import | import schema 없음 |
| Schedule | schedule schema 없음 |
| Meeting Note | meeting note schema 없음 |
| Product Analytics | analytics event/snapshot schema 없음 |

## 3. 현재 코드 기준

- `/api/contacts`, `/api/products`, `/api/deals` API는 제공하지 않는다.
- 고정형 고객사/담당자/상품/딜 route는 User Web 활성 화면이 아니다.
- `FE/user-web`에는 일부 자리만 남은 feature folder나 public/help copy 잔존물이 있을 수 있으나, 활성 CRM 도메인으로 해석하지 않는다.
- 과거 구현 맥락이 필요하면 git history 또는 완료 보관 TODO를 확인한다.

## 4. 보존해야 하는 예외

`PublicContactRequest`에는 공개 문의자가 입력하는 회사명과 회사 규모 필드가 남아 있다.

이 값은 공개 문의 원문 보존 필드이며, 고정형 Company record나 CRM 도메인 객체가 아니다.

## 5. 후속 방향

다음 CRM Core는 고정형 Company/Product/Deal 테이블을 되살리는 방식이 아니다.

후속 schema 설계는 `CRM_CORE_SCHEMA_DRAFT.md`를 기준으로 별도 검토한다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
