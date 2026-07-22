# DB Schema TODO

상태: Draft

## 모델 후보

- `AdminAuditLog`
- `AdminSensitiveAccessLog`
- `AdminSupportNote`
- `ProviderFailureLog`
- `AccountDeletionRequest`
- `UserDataExportRequest`
- `DataRetentionPolicy`
- `BackupRestoreRunLog`

## 결정 baseline 반영 후 세부 확인

- `INITIAL_ADMIN_EMAILS` bootstrap과 기존 user role 확장 방식
- 민감 원문 조회 log 필수 필드
- audit log 보관 기간
- provider failure log와 연결 방식
- Trash 만료/purge 상태를 기존 모델 column으로 처리할지 별도 log로 둘지
- Trash private memo response restriction을 schema 변경 없이 mapper/DTO/test로 처리할지, redacted snapshot 정책이 필요한지
- 계정 삭제 요청을 hard delete로 처리할지 anonymize/delete workflow로 처리할지
- 사용자 데이터 export request와 `ExportJob`을 연결할지
- DB/Prisma gate 결과를 DB에 남길지 운영 문서로만 둘지
- backup/restore run log가 필요한지

## migration 주의

- Admin audit는 삭제하거나 수정하기 어려운 append-only 성격이 적합하다.
- 민감 원문 조회 사유는 필수로 둔다.
- 계정 삭제/데이터 삭제는 irreversible action이므로 audit와 idempotency가 필요하다.
- backup/restore와 migration 상태에는 secret이나 DB URL을 저장하지 않는다.
- `NBA-014`는 신규 schema보다 운영 closeout 성격이다. 신규 migration이 있는 다른 goal에서는 11 구현 전에도 DB target, migration status, generate/seed 정책을 선행 확인한다.
