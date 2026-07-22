# 11 Admin Operation

상태: Draft Slot
순서: 11
성격: 마지막 운영 묶음 검토 슬롯 + first-sale 운영 gate 상세 closeout
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

## 1. 목적

유료 고객 운영 전에 사용자, 구독 상태, 도메인 데이터, 민감정보 마스킹, 감사 로그, provider 실패를 운영자가 처리할 수 있는 Admin 기반을 만든다. 이 슬롯에는 Trash/삭제 정책, 계정 삭제/데이터 삭제, 사용자 데이터 export 정책, DB/Prisma/migration gate, backup/restore 같은 운영 신뢰 기능도 포함한다.

주의: 이 슬롯이 11번이라는 이유로 모든 운영 gate를 11까지 미루지 않는다. `NBA-014` DB/Prisma 운영 gate는 신규 migration이 있는 goal마다 선행 체크하고, 11에서는 운영 closeout과 Admin/observability 상세 구현을 닫는다. `NBA-007` Trash private memo backend response restriction은 Trash/삭제 정책 안에 묻지 않고 별도 보안 항목으로 추적한다.

## 2. 현재 상태

- `/admin/api/me`만 구현되어 있다.
- Admin Web `/`는 placeholder이고 대부분 route가 redirect된다.
- Admin 운영 API와 화면은 아직 없다.
- Trash는 7일 이내 복구 중심이며 만료/purge/복구 불가/유료 복구 정책은 정리되지 않았다.
- DB/Prisma/migration 운영 gate와 backup/restore 기준은 별도 운영 정리가 필요하다.
- 계정 삭제, 데이터 삭제, 사용자 데이터 export 정책/API는 없다.
- Trash private memo 원문을 Backend response에서 어디까지 제한할지 확정되어 있지 않다.

## 3. 착수 전 해야 할 일

추천 결정:

- 최소 Admin부터 시작한다.
- 사용자와 핵심 domain data는 read-only 조회를 기본으로 한다.
- 민감정보는 masking하고 raw 조회는 reason 필수와 append-only audit log를 요구한다.
- 계정 삭제, 데이터 export, provider failure, DB/migration gate는 운영 신뢰 필수 범위로 포함한다.
- `NBA-014`는 release blocker 성격이므로 11 상세 구현 전에도 migration goal마다 선행 체크한다.
- `NBA-007`은 Trash/삭제 정책과 별도 보안 체크로 두고, FE 숨김만으로 완료 처리하지 않는다.
- User Web과 Admin Web API/client 경계는 섞지 않는다.

1. 결제/구독 이전에 필요한 최소 Admin 범위는 사용자/핵심 domain read-only와 provider failure 확인으로 둔다.
2. 민감정보 마스킹과 원문 조회 사유 입력 정책을 정한다.
3. raw 조회와 주요 운영 action은 append-only audit log를 남긴다.
4. User Web과 Admin Web 코드 공유 금지 기준을 유지한다.
5. Trash/삭제/복구/영구삭제 정책과 계정 삭제/데이터 삭제 범위를 정한다.
6. Trash private memo backend response restriction 기준을 독립 항목으로 정한다.
7. DB/Prisma/migration, backup/restore, provider failure 운영 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-013
