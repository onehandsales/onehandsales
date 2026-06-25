# 로그 soft delete API 및 문서 동기화 작업 로그

## 1. 작업명

회사/담당자/제품/딜 로그 soft delete API 및 User Web 삭제 UX 구현, 문서 동기화

## 2. 작업 일자

2026-06-25

## 3. 관련 계획과 goal

- 관련 계획: `TODO/LOG_SOFT_DELETE_PLAN`
- 관련 작업: Company/Contact/Product memo/private memo log, Deal following action/memo log 삭제 API 및 UI

## 4. 관련 AGENT/TODO 문서

- `AGENT/PM_AGENT/PLANNING/TRASH_DELETE_POLICY_BACKEND_GUIDE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/LOG_SOFT_DELETE_PLAN/COMMON/API-SPEC/LOG_SOFT_DELETE_API.md`

## 5. 예정 범위

- 8개 로그 삭제 API를 soft delete 방식으로 구현한다.
- 삭제 시 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- 일반 조회/수정은 삭제되지 않은 로그만 대상으로 한다.
- User Web에서 삭제 확인 모달, 빨간 휴지통 아이콘, 성공 안내 문구를 연결한다.
- 구현 후 아키텍처/컨벤션/DB/API 문서를 현재 상태와 맞춘다.

## 6. 진행 기록

- Prisma schema와 migration에 8개 로그 테이블의 삭제 상태 컬럼과 인덱스를 추가했다.
- Backend controller/application/repository 계층에 DELETE API를 추가하고 controller는 application 위임만 하도록 유지했다.
- User Web 상세 화면의 로그 action 영역에 삭제 버튼과 공통 확인 모달을 연결했다.
- 공통 toast는 설명 문구를 표시할 수 있게 하고 hook을 별도 파일로 분리했다.
- 추가 리뷰에서 딜 삭제 application service의 numbered step comment를 보강했다.
- DB_SCHEMA, API_SAMPLE, 휴지통 정책 가이드, DDL snapshot, 작업 API 계약 문서를 구현 상태에 맞게 갱신했다.

## 7. 적용 범위 또는 변경 파일

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260625010000_add_log_soft_delete_columns/migration.sql`
- `BE/src/modules/company`
- `BE/src/modules/contact`
- `BE/src/modules/product`
- `BE/src/modules/deal`
- `BE/src/shared/application/trash/trash-retention.ts`
- `FE/user-web/src/features/company`
- `FE/user-web/src/features/contact`
- `FE/user-web/src/features/product`
- `FE/user-web/src/features/deal`
- `FE/user-web/src/components/ui/confirm-dialog.tsx`
- `FE/user-web/src/components/ui/toast.tsx`
- `FE/user-web/src/components/ui/use-toast.tsx`
- `FE/user-web/src/utils/log-delete-feedback.ts`
- `AGENT/PM_AGENT/PLANNING/TRASH_DELETE_POLICY_BACKEND_GUIDE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*`
- `API_SAMPLE.md`
- `current-schema-ddl.sql`
- `TODO/LOG_SOFT_DELETE_PLAN`

## 8. 검증 결과

- Backend `prisma:validate`: 통과
- Backend `prisma:generate`: 통과
- Backend `prisma:migrate:deploy`: 로컬 DB 적용 완료
- Backend `lint`: 통과
- Backend `typecheck`: 통과
- Backend `test -- --runInBand`: 통과
- Backend `build`: 통과
- User Web `lint`: 통과
- User Web `typecheck`: 통과
- User Web `build`: 통과
- 로컬 health 확인: `GET /api/health` 200

## 9. 검토 결과

- 상태: 완료
- soft delete는 단일 row update로 처리되어 transaction이 필요하지 않다.
- 삭제된 로그는 일반 조회/수정/딜 최근 행동 계산에서 제외된다.
- 비밀 메모 삭제 시 암호문과 key version은 변경하지 않아 복구 가능성을 유지한다.
- 휴지통 목록/복구/유료 복구 API는 후속 작업으로 남긴다.

## 10. 남은 리스크 또는 보류 사항

- 휴지통 목록에서 어떤 필드를 보여줄지 아직 확정되지 않았다.
- 7일 이후 “영구 삭제 상태”는 현재 `trashExpiresAt`으로 판단할 수 있지만, 실제 노출 제외/유료 복구 API는 미구현이다.
- Company/Contact/Product/Deal 본문 row 삭제 API는 아직 구현 범위가 아니다.

## 11. 다음 권장 작업

- 휴지통 목록 API 계약을 먼저 확정한다.
- 로그 복구 API와 7일 이후 유료 복구 정책을 별도 계획으로 분리한다.
- 필요하면 삭제/복구 이벤트를 감사 로그 테이블로 확장한다.

## 12. 전체 작업 진행 현황

- 로그 삭제 API: 완료
- User Web 로그 삭제 UX: 완료
- 문서 동기화: 완료
- 휴지통 목록/복구/유료 복구: 후속 범위
