# Deal Schema

딜 도메인은 거래 기본 정보, 회사/담당자/제품 연결, 다음 행동, 메모, 활동 로그를 관리한다.

## Tables

- `Deal`
- `DealCompany`
- `DealContact`
- `DealProduct`
- `DealFollowingActionLog`
- `DealMemoLog`
- `DealActivity`

## Deal

| 컬럼 | 설명 |
| --- | --- |
| `id` | 딜 ID |
| `userId` | 소유 사용자 ID |
| `dealName` | 딜 이름 |
| `dealCost` | 딜 금액 |
| `dealStatus` | 코드 레벨 상태 값 |
| `expectedEndDate` | 예상 마감일 |
| `createdAt`, `updatedAt` | 생성/수정 시각 |
| `deletedAt`, `deletedByUserId`, `trashExpiresAt` | 휴지통 정책 필드 |

## Relations

- `Deal.userId` -> `User.id`
- `Deal` 1:N `DealCompany`
- `Deal` 1:N `DealContact`
- `Deal` 1:N `DealProduct`
- `Deal` 1:N `DealFollowingActionLog`
- `Deal` 1:N `DealMemoLog`
- `Deal` 1:N `DealActivity`

## Join Tables

- `DealCompany`: 딜과 회사 N:M 연결
- `DealContact`: 딜과 담당자 N:M 연결
- `DealProduct`: 딜과 제품 N:M 연결

각 연결 table은 `userId`, 대상 FK, 생성/수정 시각을 갖고, 같은 딜 안의 중복 연결을 unique 제약으로 막는다.

## DealFollowingActionLog

딜의 다음 행동 로그를 저장한다.

- `followingAction`: 다음에 해야 할 행동
- `checkComplete`: 완료 여부
- `deletedAt`, `deletedByUserId`, `trashExpiresAt`: 휴지통 정책 필드

딜 생성 시 첫 다음 행동을 같은 transaction에서 생성할 수 있다.

## DealMemoLog

딜 메모 로그를 저장한다.

- `memoType`: 메모 유형
- `memo`: 메모 본문
- `deletedAt`, `deletedByUserId`, `trashExpiresAt`: 휴지통 정책 필드

## DealActivity

딜의 활동 timeline을 저장한다.

- `activityType`: 활동 종류
- `sourceType`: 시스템/사용자/다음 행동 origin 구분
- `occurredAt`: 활동 발생 시각
- `title`, `description`: 화면 표시 텍스트
- `linkedRecordsJson`: 연결 record metadata

## 정책

- 모든 query는 current user ownership을 검증한다.
- 일반 목록/상세/검색/export는 `deletedAt IS NULL` row만 대상으로 한다.
- 삭제는 실제 row 제거가 아니라 soft delete다.
- 복구는 Trash API에서 복구 기간 안의 row만 허용한다.
