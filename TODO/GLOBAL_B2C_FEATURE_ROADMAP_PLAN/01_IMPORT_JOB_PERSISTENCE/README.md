# 01 ImportJob Persistence

상태: Draft Slot
순서: 01
성격: 기능 구현 전 검토 슬롯

## 1. 목적

Import 업로드, 원본/preview 보관 정책, AI 매핑, 검증, 확정 전 상태를 서버 메모리가 아니라 DB에 영속화해 새로고침, 탭 이동, 서버 재시작, 배포 중에도 이어받을 수 있게 한다.

## 2. 현재 상태

- Import template, upload, AI mapping, mapping 수정, confirm, import user log는 구현되어 있다.
- 확정 전 ImportJob은 `InMemoryImportJobStore`에 저장된다.
- 서버 재시작 또는 배포 시 확정 전 job이 사라질 수 있다.
- 업로드 원본 파일 저장 여부, preview row 보관 기간, 개인정보 삭제 요청 시 처리 범위가 확정되어 있지 않다.

## 3. 착수 전 해야 할 일

1. `COMMON/SCOPE.md`에서 TTL, cleanup, 보관 정책을 확정한다.
2. `BE-TODO/DB-SCHEMA.md`에서 `ImportJob`, `ImportJobRow` 또는 기존 `ImportUserLog` 확장 여부를 결정한다.
3. `BE-TODO/API-TODO.md`에서 resume/list/cancel API가 필요한지 결정한다.
4. `FE-TODO/USER-WEB-TODO.md`에서 새로고침 후 이어받기 UX를 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-006
- `BE/src/modules/data-import/infrastructure/persistence/in-memory-import-job.store.ts`
