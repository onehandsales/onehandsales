# 11 Admin Operation

상태: Draft Slot
순서: 11
성격: 마지막 운영 묶음 검토 슬롯

## 1. 목적

유료 고객 운영 전에 사용자, 구독 상태, 도메인 데이터, 민감정보 마스킹, 감사 로그, provider 실패를 운영자가 처리할 수 있는 Admin 기반을 만든다. 이 슬롯에는 Trash/삭제 정책, 계정 삭제/데이터 삭제, 사용자 데이터 export 정책, DB/Prisma/migration gate, backup/restore 같은 운영 신뢰 기능도 포함한다.

## 2. 현재 상태

- `/admin/api/me`만 구현되어 있다.
- Admin Web `/`는 placeholder이고 대부분 route가 redirect된다.
- Admin 운영 API와 화면은 아직 없다.
- Trash는 7일 이내 복구 중심이며 만료/purge/복구 불가/유료 복구 정책은 정리되지 않았다.
- DB/Prisma/migration 운영 gate와 backup/restore 기준은 별도 운영 정리가 필요하다.
- 계정 삭제, 데이터 삭제, 사용자 데이터 export 정책/API는 없다.

## 3. 착수 전 해야 할 일

1. 결제/구독 이전에 필요한 최소 Admin 범위를 정한다.
2. 민감정보 마스킹과 원문 조회 사유 입력 정책을 정한다.
3. audit log 범위를 정한다.
4. User Web과 Admin Web 코드 공유 금지 기준을 유지한다.
5. Trash/삭제/복구/영구삭제 정책과 계정 삭제/데이터 삭제 범위를 정한다.
6. DB/Prisma/migration, backup/restore, provider failure 운영 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-013
