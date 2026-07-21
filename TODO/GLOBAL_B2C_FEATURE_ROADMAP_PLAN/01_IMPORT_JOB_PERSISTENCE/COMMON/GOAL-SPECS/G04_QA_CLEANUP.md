# G04 QA Cleanup

상태: Done
완료일: 2026-07-21
완료 근거: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

## 1. 목적

G01~G03 구현 결과가 Global B2C 첫 판매 gate의 Data reliability 범위와 충돌하지 않는지 확인하고, import persistence 기능을 QA 기준으로 닫는다.

## 2. 선행 조건

- G01 DB persistence foundation 완료
- G02 Backend ImportJob API 완료
- G03 User Web resume UX 완료

## 3. 포함 범위

- Backend validation, lint, test, build
- User Web typecheck, lint, build, E2E
- upload -> map -> row edit -> validate -> confirm 수동 QA
- refresh/resume 수동 QA
- cancel/expired/failed 상태 QA
- cross-user 접근 차단 QA
- storage delete 실패 처리 QA
- log redaction 확인
- 문서 상태와 구현 결과 정합성 점검

## 4. 제외 범위

- 결제/구독 QA
- Admin 운영 API/화면 QA
- 제품 분석 event taxonomy
- Notification delivery QA
- 다국가 phone/currency/address QA
- Schedule week report QA

## 5. 수동 QA 시나리오

```text
1. 회사 CSV 업로드 -> 매핑 확인 -> confirm
2. 담당자 CSV 업로드 -> 새로고침 -> row 수정 -> confirm
3. 제품 CSV 업로드 -> mapping 수정 -> validate -> confirm
4. 딜 CSV 업로드 -> 회사/담당자/제품 연결 보정 -> confirm
5. 업로드 후 새 탭에서 detail route 접근 -> 같은 상태 복구
6. 업로드 후 cancel -> active 목록 제거
7. expired job detail 접근 -> 새 파일 시작 안내
8. 다른 user job id 접근 -> 404 처리
9. storage delete 실패 강제 -> import 성공 유지와 ImportJobError 기록 확인
10. log에서 raw row, phone, email, provider raw response가 남지 않는지 확인
```

## 6. 검증 명령

Backend:

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- data-import
pnpm run build
```

User Web:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 7. 문서 closeout 기준

- 구현 결과가 `COMMON/API-SPEC/IMPORT_JOB_API.md`와 다르면 API spec을 갱신한다.
- 구현 결과가 `BE-TODO/DB-SCHEMA.md`와 다르면 DB 문서를 갱신한다.
- 구현 결과가 `FE-TODO/USER-WEB-TODO.md`와 다르면 FE 문서를 갱신한다.
- QA 결과는 작업 결과 또는 TODO_LOG에 남긴다.
- 결제/Admin/다국어/분석 같은 첫 판매 gate 항목은 이 goal에 끌어오지 않고 별도 계획으로 남긴다.

## 8. 완료 기준

- Backend 검증 명령이 통과한다.
- User Web 검증 명령이 통과한다.
- 핵심 수동 QA가 통과한다.
- cross-user 접근 차단이 확인된다.
- raw import data가 log/error response에 노출되지 않는다.
- 원본 파일 삭제 실패가 import 성공을 깨뜨리지 않고 추적된다.
- 01 문서와 구현 결과 사이의 불일치가 없다.
