# G21 BusinessCard OCR Backend

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
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

## 요구사항 체크
- `POST /api/business-cards/scan` OCR 요청 API를 구현한다.
- `GET /api/business-cards/:scanId` OCR 결과 조회 API를 구현한다.
- `POST /api/business-cards/:scanId/confirm` OCR 결과 확정 저장 API를 구현한다.
- 이미지 파일 형식/MIME/용량을 검증한다.
- 명함 이미지는 `StoragePort`로 저장하고 BusinessCardScan에는 bucket/object key metadata를 저장한다.
- OCR port와 실제 OpenAI/OCR adapter를 둔다.
- OCR 결과는 자동으로 Company/Contact를 생성하지 않는다.
- 기존 회사 후보를 조회한다.
- 사용자가 확정해야 Company/Contact가 생성된다.

## 제외 범위
- 모바일 카메라 촬영
- Frontend 화면

## 작업 로그
- G21 기준 문서와 API 계약을 확인했다.
- 기존 `business-card` 모듈은 README만 있고 구현 파일은 없는 상태임을 확인했다.
- `StoragePort`, Supabase storage adapter, `BusinessCardScan`, `AiJob`, `Company`, `Contact` Prisma 모델을 확인했다.
- BusinessCard domain error, OCR port, repository port, response mapper를 추가했다.
- `POST /api/business-cards/scan`, `GET /api/business-cards/:scanId`, `POST /api/business-cards/:scanId/confirm` controller/DTO를 추가했다.
- 이미지 MIME/확장자/용량 validation을 추가했다.
- 명함 이미지를 `StoragePort`로 업로드하고 BusinessCardScan에 bucket/object key 중심 metadata를 저장하도록 했다.
- OCR 요청 시 BusinessCardScan과 AiJob을 기록하고, 성공/실패 상태를 업데이트하도록 했다.
- 실제 OpenAI Responses API 기반 BusinessCard OCR adapter를 추가했다.
- OCR 결과 조회 시 추출 필드와 기존 회사 후보를 반환하도록 했다.
- 확정 저장 API에서 `EXISTING`, `NEW`, `NONE` 회사 처리 방식을 지원하고 Contact 생성과 scan confirmed 상태 변경을 transaction으로 처리하도록 했다.
- BusinessCard module을 AppModule에 등록하고 도메인 에러 HTTP status mapping을 추가했다.
- BusinessCard 유스케이스 테스트를 추가했다.

## 검토
- OCR 결과는 자동으로 Company/Contact를 생성하지 않고 BusinessCardScan 추출 필드로만 저장한다.
- 사용자가 confirm API를 호출해야 Company/Contact가 생성된다.
- 명함 이미지는 public URL이 아니라 `imageBucket`, `imageObjectKey`, `imageContentType`, `imageSizeBytes` metadata로 저장한다.
- 확정 저장은 Company/Contact/BusinessCardScan 상태 변경을 같은 transaction에서 처리한다.
- Frontend 명함 OCR 화면과 모바일 카메라 촬영은 G21 제외 범위라 구현하지 않았다.

## 검증
- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run test -- business-card.use-cases.spec.ts`
- `pnpm run test`
- `DATABASE_URL="postgresql://user:pass@localhost:5432/db" DIRECT_URL="postgresql://user:pass@localhost:5432/db" pnpm run prisma:validate`
- `pnpm run build`
- `git diff --check`

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G21 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
