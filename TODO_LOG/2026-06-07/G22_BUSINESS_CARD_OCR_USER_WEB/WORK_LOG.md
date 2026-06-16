# G22 BusinessCard OCR User Web

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

## 요구사항 체크
- 이미지 업로드 UI를 구현한다.
- 이미지 파일 형식/크기 client validation을 제공한다.
- OCR 처리 상태를 표시한다.
- OCR 결과 확인/수정 form을 제공한다.
- 기존 회사 후보 목록과 선택 UI를 제공한다.
- 새 회사 생성 또는 회사 없이 담당자 저장 선택을 제공한다.
- contactName은 필수다.
- 사용자가 확정해야 회사/담당자로 저장된다.

## 제외 범위
- 카메라 촬영
- OCR 정확도 고도화

## 작업 로그
- G22 기준 문서와 API 계약을 확인했다.
- 현재 `/contacts/scan`과 `/business-cards`가 동일한 placeholder 페이지를 사용함을 확인했다.
- 기존 `business-card` feature는 index와 `.gitkeep`만 있는 상태임을 확인했다.
- G21에서 구현한 BusinessCard OCR API 응답 형태를 기준으로 FE 타입을 설계하기로 했다.
- BusinessCard OCR API client, React Query key/query/mutation hook, FE type, Zod form schema를 추가했다.
- `/contacts/scan`, `/business-cards`에서 공통으로 사용하는 명함 OCR 화면을 placeholder에서 실제 구현으로 교체했다.
- 이미지 업로드/미리보기, 파일 형식 및 10MB 크기 검증, OCR 요청/상태 표시, 추출 결과 수정 form을 구현했다.
- 기존 회사 후보 선택, 새 회사 생성, 회사 없이 저장 모드를 제공하고 confirm 요청 전 `contactName`과 회사 처리 모드를 검증하도록 했다.
- OCR confirm 이후 저장된 담당자 상세 링크를 노출하도록 했다.

## 검토
- G22 요구사항의 client validation, OCR 처리 상태, 추출 결과 확인/수정, 회사 후보 선택, 새 회사 또는 회사 없이 저장 흐름을 모두 반영했다.
- OCR 결과는 자동 저장하지 않고 사용자가 `담당자로 저장`을 눌러 confirm API를 호출할 때만 저장되도록 했다.
- 구현 범위는 user web 화면과 BusinessCard feature client 계층에 한정했고 카메라 촬영, OCR 정확도 개선은 제외했다.
- 데스크톱/모바일 스크린샷을 확인해 주요 UI 요소가 겹치지 않고 조작 가능한 상태임을 확인했다.

## 검증
- `cd FE/user-web && pnpm run typecheck`
- `cd FE/user-web && pnpm run lint`
- `cd FE/user-web && pnpm run build`
- Playwright smoke: `/contacts/scan`에서 이미지 업로드, OCR 요청, 추출 결과 표시, 기존 회사 선택, confirm 저장, 저장된 담당자 링크 노출 확인
- Playwright mobile smoke: `/business-cards` 모바일 viewport 기본 화면 확인
- 스크린샷: `/tmp/g22-business-card-desktop.png`, `/tmp/g22-business-card-confirmed.png`, `/tmp/g22-business-card-mobile.png`

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G22 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
