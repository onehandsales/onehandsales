# G25 Export Backend

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

## 요구사항 체크
- `POST /api/exports` Export job 생성 API를 구현한다.
- `GET /api/exports/:exportJobId` Export 상태 조회 API를 구현한다.
- `GET /api/exports/:exportJobId/download` Export 파일 다운로드 API를 구현한다.
- `POST /api/schedules/week/export` 주간 일정 보고서 Export 생성 API를 구현한다.
- Export 대상은 Company, Contact, Product, Deal, Schedule, MeetingNote, Weekly Schedule Report를 다룬다.
- 민감 데이터는 기본 제외한다.
- 민감 데이터 포함 시 명시적 확인값이 필요하다.
- PDF adapter는 placeholder로 둘 수 있고 Excel adapter를 우선 구현한다.
- 생성된 Export 파일은 `StoragePort`로 저장하고 다운로드 시 signed URL을 반환한다.

## 제외 범위
- 디자인된 PDF 템플릿 완성
- 모든 도메인 export 고도화
- Frontend 화면

## 작업 로그
- G25 기준 문서와 API 계약을 재확인했다.
- Prisma에는 `ExportJob`, `ExportTargetType`, `ExportFormat`, `ExportJobStatus`가 이미 존재함을 확인했다.
- G23 Import Backend에서 추가한 `import-export` 모듈을 확장해 Export API를 구현하기로 했다.
- `ExportFormat` Prisma enum은 `PDF`, `EXCEL`만 존재하므로 G25 범위는 문서의 Excel/PDF 기준에 맞춰 구현하기로 했다.
- Export target/format 정의, Export file generator port, Export response mapper를 추가했다.
- `POST /api/exports`, `GET /api/exports/:exportJobId`, `GET /api/exports/:exportJobId/download` 컨트롤러를 추가했다.
- `POST /api/schedules/week/export` 컨트롤러를 추가해 `WEEKLY_SCHEDULE_REPORT` Export job 생성 흐름에 연결했다.
- Export job 생성 use case에서 민감 데이터 포함 확인값 검증, ExportJob 생성, 대상 데이터 조회, 파일 생성, `StoragePort` 업로드, ExportJob 완료 상태 갱신을 연결했다.
- Export 상태 조회와 signed download URL 생성 use case를 추가했다.
- Excel export는 실제 XLSX workbook buffer로 생성하고, PDF export는 placeholder PDF buffer로 생성하도록 adapter를 추가했다.
- Company, Contact, Product, Deal, Schedule, MeetingNote, Weekly Schedule Report 대상별 export row 조회를 Prisma repository에 추가했다.
- 기본 export에서는 연락처 전화번호/이메일/주소, 일정 장소/메모, 회의록 상세/다음 계획/필요 조치 같은 민감 후보 필드를 제외하고, `includeSensitiveData=true`와 `sensitiveConfirm=true`일 때만 포함하도록 했다.
- `SensitiveExportConfirmationRequired`, `ExportFileNotReady`, `ExportJobNotFound` error 흐름을 추가하고 HTTP status mapping을 갱신했다.
- Import use case 테스트의 fake repository를 Export port 확장에 맞게 갱신하고 Export 생성/다운로드 테스트를 추가했다.
- XLSX/PDF file generator adapter 테스트를 추가했다.

## 검토
- G25 요구사항의 Export job 생성, 상태 조회, 다운로드, 주간 일정 보고서 export endpoint를 모두 반영했다.
- 생성 파일은 `StoragePort`를 통해 저장하고 DB에는 bucket/object key/content type/size/file name metadata만 저장한다.
- 민감 데이터 포함은 명시 확인값 없이는 `SensitiveExportConfirmationRequired`로 차단된다.
- PDF는 문서 범위대로 placeholder로 두고 Excel 파일 생성은 실제 XLSX adapter로 구현했다.
- Export는 동기 생성 방식으로 구현했으며 job 상태는 `PROCESSING`에서 파일 생성/업로드 완료 후 `COMPLETED`로 갱신된다.

## 검증
- `cd BE && pnpm run typecheck`
- `cd BE && pnpm run lint`
- `cd BE && pnpm test -- import-export`
- `cd BE && pnpm test`
- `cd BE && pnpm run build`
- Export use case unit test: ExportJob 생성, 파일 생성, StoragePort 업로드, 완료 상태 갱신, 민감 데이터 confirm 차단, signed download URL 확인
- Export generator adapter unit test: 한글 XLSX workbook 생성, PDF placeholder 생성 확인

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G25 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
