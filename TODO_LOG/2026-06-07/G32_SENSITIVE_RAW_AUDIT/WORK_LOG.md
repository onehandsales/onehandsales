# G32 민감정보 원문 조회와 감사 로그

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/ADMIN_WEB.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P5-G30-G32-ADMIN-AUDIT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`

## 요구사항 체크
- Backend raw sensitive view API를 구현한다.
- 원문 조회 시 reason 필수 validation을 적용한다.
- 원문 조회와 AuditLog 생성을 transaction으로 처리한다.
- 암호화된 PersonalMemo/MeetingNote 원문은 감사 로그 기록 이후에만 복호화한다.
- Admin Web에 reason dialog와 원문 일시 표시 상태를 구현한다.
- 감사 로그 목록/상세 화면을 구현한다.
- client/server log에 PII와 reason 전문을 남기지 않는다.

## 제외 범위
- 모든 위험 액션 전반
- 결제 상태 변경
- 사용자 상태 변경 API

## 작업 로그
- G32 기준 문서와 G30/G31 구현 상태를 확인했다.
- 기존 Admin module에 query 전용 use case/repository/controller만 있음을 확인했다.
- `AuditLog` 모델은 `ipAddress`, `userAgent` 전용 컬럼이 없으므로 metadata에 요청 메타데이터를 저장하는 방향으로 결정했다.
- Backend에 Admin 민감 원문 조회 port/use case/Prisma repository/controller/DTO를 추가했다.
- `POST /admin/api/sensitive/raw`, `POST /admin/api/deals/:dealId/sensitive/raw`, `POST /admin/api/meeting-notes/:meetingNoteId/sensitive/raw`를 구현했다.
- `GET /admin/api/audit-logs`, `GET /admin/api/audit-logs/:auditLogId`를 구현했다.
- 허용 raw field를 연락처 phone/email, 제품 unitPrice, 딜 amount, 도메인 최신 Memo, 회의록 rawText/details/nextPlan/requiredAction, PersonalMemo content로 제한했다.
- AuditLog에는 action, target, target user, reason, 요청 field 이름, IP, user-agent만 기록하고 원문 값은 기록하지 않도록 했다.
- Admin Web 도메인 상세 패널에 민감 원문 reason dialog와 field별 일시 표시 상태를 추가했다.
- Admin Web `/audit-logs` placeholder를 감사 로그 목록/필터/상세 패널 화면으로 교체했다.

## 검토
- reason은 use case에서 최소 10자 이상으로 검증하고, 누락/부족 시 repository 호출 전에 실패한다.
- raw field allow-list 검증은 Prisma transaction 전에 실행해 허용되지 않은 field가 AuditLog를 만들거나 대상 조회를 실행하지 않게 했다.
- Prisma adapter는 target 조회와 AuditLog 생성을 transaction에서 처리하고, 암호화 field는 AuditLog 생성 이후에만 복호화한다.
- 감사 로그 목록/상세 response는 `reasonSummary`만 반환하며 원문 민감정보와 reason 전문을 포함하지 않는다.
- DB schema 변경 없이 `AuditLog.metadata`에 IP/user-agent/field 이름을 저장했다.
- Admin Web은 client console log 없이 raw response를 해당 화면의 local state에만 저장하므로 새로고침 또는 화면 이탈 시 마스킹 상태로 돌아간다.

## 검증
- `cd BE && pnpm run typecheck`
- `cd BE && pnpm run lint`
- `cd BE && pnpm test -- admin`
- `cd BE && pnpm run build`
- `cd BE && pnpm test`
- `cd FE/admin-web && pnpm run typecheck`
- `cd FE/admin-web && pnpm run lint`
- `cd FE/admin-web && pnpm run build`
- Playwright mock smoke: 거래처 상세에서 reason dialog 열기, 사유 제출, raw phone 일시 표시, 감사 로그 목록/상세 확인.
- 캡처: `/tmp/g32-raw-dialog.png`, `/tmp/g32-raw-revealed.png`, `/tmp/g32-audit-logs.png`, `/tmp/g32-audit-logs-mobile.png`

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G32 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
