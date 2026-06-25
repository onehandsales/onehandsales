# 휴지통/삭제 정책 백엔드 개발 가이드

## 1. 목적

주요 사용자 데이터의 삭제 버튼은 DB row를 실제로 삭제하지 않는다. 삭제 API는 일반 화면에서 보이지 않도록 soft delete 상태를 기록하고, 휴지통 API는 복구 가능 기간 안의 삭제 데이터를 목록/상세/복구 대상으로 제공한다.

현재 구현 기준:

- 삭제 시 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- `trashExpiresAt`은 `deletedAt + 7일`이다.
- DB 저장 시각은 UTC instant로 저장한다.
- 7일 이내 복구는 무료 복구 기간으로 본다.
- 7일 후에는 일반 휴지통 목록에서 보이지 않는 영구 삭제 상태로 취급하지만, DB row를 hard delete하지 않는다.
- 향후 유료 영구 삭제 복구 기능을 만들 수 있어야 하므로 row 삭제, 암호문 초기화, 연결 row 삭제는 하지 않는다.

## 2. 현재 삭제 API 구현 범위

본문 데이터:

- `DELETE /api/companies/:companyId`
- `DELETE /api/contacts/:contactId`
- `DELETE /api/products/:productId`
- `DELETE /api/deals/:dealId`

로그 데이터:

- 회사 일반 메모 로그, 회사 비밀 메모 로그
- 담당자 일반 메모 로그, 담당자 비밀 메모 로그
- 제품 일반 메모 로그, 제품 비밀 메모 로그
- 딜 다음행동 로그, 딜 일반 메모 로그

성공 응답은 모두 `204 No Content`다. 없는 ID, 다른 사용자의 ID, 이미 삭제된 ID는 현재 일반 상세/수정 정책과 동일하게 `404 NotFound`로 처리한다.

## 3. 컬럼 규칙

soft delete 대상 테이블은 다음 컬럼을 사용한다.

| 컬럼 | 의미 |
| --- | --- |
| `deletedAt` | 사용자가 삭제를 누른 UTC 시각. `null`이면 활성 데이터 |
| `deletedByUserId` | 삭제를 수행한 사용자 ID |
| `trashExpiresAt` | 무료 복구 가능 기간 종료 시각. 현재 `deletedAt + 7일` |

현재 `permanentDeleteAt`은 사용하지 않는다. 7일 후 숨김 기준은 `trashExpiresAt`으로 판단한다.

## 4. 조회 필터 규칙

일반 화면과 일반 API는 기본적으로 `deletedAt IS NULL`만 조회한다.

대상:

- 목록, 상세, 수정 전 존재 확인
- export
- Global Search
- 생성/수정 form option API
- 홈 대시보드 집계
- 일정/회의록/딜 연결 옵션

회사/담당자/제품/딜 상세의 연결 목록도 삭제된 연결 대상은 일반 목록에서 제외한다. 단, 딜의 기존 연결 이력은 삭제된 회사/담당자/제품을 완전히 없애지 않고 응답에 `isDeleted: true`를 포함해 UI에서 `(삭제됨)`으로 표시할 수 있다.

## 5. 휴지통 API 구현 범위

현재 구현된 휴지통 API:

- `GET /api/trash`: `deletedAt IS NOT NULL`이고 `trashExpiresAt > now`인 항목만 목록에 보여준다.
- `GET /api/trash/:targetType/:targetId`: row 클릭 후 상세 모달에서 보여줄 요약, 위치, 삭제일, 남은 기간, 주요 필드, 일반 메모 내용을 반환한다.
- `POST /api/trash/:targetType/:targetId/restore`: `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 `null`로 되돌린다.

현재 지원 대상:

- 본문 데이터: `Company`, `Contact`, `Product`, `Deal`
- 로그 데이터: `CompanyMemoLog`, `CompanyUserPrivateMemoLog`, `ContactMemoLog`, `ContactUserPrivateMemoLog`, `ProductMemoLog`, `ProductUserPrivateMemoLog`, `DealMemoLog`, `DealFollowingActionLog`

아직 구현하지 않은 범위:

- 7일 이후 유료 복구 UI/API
- 관리자용 삭제/복구 감사 조회
- 회의록, 일정, 알림, import/export job의 휴지통 처리

일반 휴지통 목록은 `trashExpiresAt` 이후 항목을 보여주지 않는다. 유료 복구 목록은 별도 정책이 확정되기 전까지 구현하지 않는다.

## 6. 프론트 UX 규칙

- 삭제 아이콘은 수정 아이콘 옆에 빨간 휴지통 아이콘으로 배치한다.
- 삭제 클릭 시 작은 중앙 모달로 `데이터를 삭제하시겠습니까?`를 보여준다.
- 버튼은 `아니요`, `예`를 사용하고 둘 다 모달 중앙 정렬을 유지한다.
- 삭제 성공 시 중앙 성공 모달을 보여준다.
- 성공 제목은 `삭제가 완료되었습니다.`로 통일한다.
- 보조 문구는 `7일안으로 휴지통에서 복구가 가능합니다.`로 통일한다.
- 성공 아이콘은 단색 `#4880EE` 배경과 동일 색상 테두리, 흰색 체크 아이콘을 사용한다.
