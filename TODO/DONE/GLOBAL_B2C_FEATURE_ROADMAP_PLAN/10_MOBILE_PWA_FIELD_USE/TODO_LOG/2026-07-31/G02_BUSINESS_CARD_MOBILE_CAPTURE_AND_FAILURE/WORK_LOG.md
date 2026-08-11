# G02 BusinessCard Mobile Capture And Failure Work Log

상태: Done
작성일: 2026-07-31
완료일: 2026-07-31

## 작업 내용

- `BusinessCardScanLog`에 safe OCR failure fields와 복합 인덱스를 추가하는 Prisma schema/migration을 만들었다.
- Backend BusinessCard application/repository/controller/provider에 safe failure 저장, 응답 mapper, 과거 row fallback, 이미지 검증 오류 코드를 반영했다.
- `business_card_ocr_failed` server analytics event를 ProductAnalytics allowlist/recorder/test에 추가했다.
- User Web 명함 스캔 모달에 `accept="image/*"`, `capture="environment"` input과 OCR 실패 CTA `다시 촬영`, `파일 바꾸기`, `수동 입력`을 추가했다.
- E2E mock과 mobile browser QA에 명함 OCR 실패 모달 검증을 추가했다.
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/BUSINESS_CARD_SCHEMA.md`, G02 goal 문서, BE/FE TODO를 구현 결과와 맞췄다.

## 검토 결과

- 검토 횟수: 3회
- 1차 검토: G02/API/Prisma/UXUI/SOFTWARE 기준과 현행 BE/FE 코드를 대조해 누락 지점을 확인했다.
- 2차 검토: 테스트/빌드 통과 후 공통 체크리스트를 대조하다가 Multer 10MB limit이 service 전 예외를 낼 수 있음을 발견했다.
- 수정 사항: 명함 scan endpoint 전용 `BusinessCardUploadExceptionFilter`를 추가해 `PayloadTooLargeException`을 `IMAGE_TOO_LARGE` safe response로 변환했고 controller spec으로 고정했다.
- 3차 검토: G02 checklist, 공통 review checklist, diff/stat, raw provider detail/범위 확장 검색을 다시 확인했다. 추가 수정 사항은 없었다.

## 검증

```powershell
pnpm.cmd --dir BE run prisma:validate
pnpm.cmd --dir BE exec prisma generate --no-engine
pnpm.cmd --dir BE exec jest src/modules/business-card/application/services/business-card-application.service.spec.ts src/modules/analytics/domain/product-analytics-event-taxonomy.spec.ts src/modules/analytics/application/services/product-analytics-event-recorder.spec.ts --runInBand
pnpm.cmd --dir BE exec jest src/modules/business-card/presentation/http/business-card.controller.spec.ts src/modules/business-card/application/services/business-card-application.service.spec.ts --runInBand
pnpm.cmd --dir BE run typecheck
pnpm.cmd --dir BE run lint
pnpm.cmd --dir BE test -- --runInBand
pnpm.cmd --dir BE run build
pnpm.cmd --dir FE/user-web exec vitest run src/features/business-card/schemas/business-card-schema.test.ts
pnpm.cmd --dir FE/user-web run typecheck
pnpm.cmd --dir FE/user-web run lint
pnpm.cmd --dir FE/user-web run test
pnpm.cmd --dir FE/user-web run build
pnpm.cmd --dir FE/user-web exec playwright test -c playwright.release-qa.config.ts tests/e2e/mobile-browser-qa.spec.ts --project=mobile-chrome-390 --project=mobile-chrome-360
```

검증 결과:

- Prisma schema validation 통과.
- Prisma Client type generation은 `--no-engine`으로 성공했다.
- BE targeted Jest 통과, 전체 Jest 78 suites / 398 tests 통과.
- BE typecheck/lint/build 통과.
- FE targeted Vitest 통과, 전체 Vitest 4 files / 42 tests 통과.
- FE typecheck/lint/build 통과.
- Mobile Playwright release QA 390px/360px 8 tests 통과.

## 미실행 검증

- `prisma migrate dev/deploy`: `.env`의 DB host가 Supabase pooler로 확인되어 운영/공유성 DB 변경을 피하기 위해 실행하지 않았다.
- `pnpm.cmd --dir BE run prisma:generate`: Windows에서 실행 중인 Backend Node 프로세스가 Prisma engine DLL을 잠가 `EPERM`으로 실패했다. 타입 갱신은 `pnpm.cmd --dir BE exec prisma generate --no-engine`으로 완료했다.

## 후속

- 다음 goal은 `G03_MEETING_NOTE_MOBILE_RECORDING`이다.
