# Deal 모듈

G12 Deal Backend vertical slice 구현 모듈이다.

## 범위

- `Deal` 목록, 생성, 상세, 수정, soft delete, 복구
- 단계 변경 시 `DealActivity` 자동 생성
- 다음 행동 수정, 완료, 미루기
- `DealActivity` 목록, 생성, 수정, soft delete
- `Company`, `Contact`, `Product` 소유권과 삭제 상태 검증
- `ProductConnection` 기반 딜-제품 연결
- `PersonalMemoTargetType.DEAL` 기반 초기 메모 암호화 저장과 상세 조회 복호화

## 구조

- `domain`: Deal 전용 domain error
- `application`: port, response mapper, use case, 입력 정규화
- `infrastructure`: Prisma repository
- `presentation`: HTTP controller와 DTO
