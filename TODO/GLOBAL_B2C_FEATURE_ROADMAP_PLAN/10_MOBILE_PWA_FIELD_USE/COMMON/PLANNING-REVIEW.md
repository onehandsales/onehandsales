# Planning Review

상태: Confirmed

## 1. 결론

10번은 Global B2C 개인 영업자 제품에서 모바일 필수 현장 사용성을 만드는 계획이다. 현재 1차 구현은 native app이 아니라 모바일 브라우저/PWA 기반이다.

## 2. Global B2C 적합성

- 영업자는 외근 중 명함, 회의, 일정, 딜 후속 행동을 바로 기록해야 한다.
- 모바일은 실험 후보가 아니라 Global B2C 제품 경험의 필수 환경이다.
- 10번은 결제/구독/Admin 전에도 `/app` 핵심 업무 흐름의 모바일 입력성을 끌어올린다.
- iOS/Android native app은 필수 후속 로드맵으로 남긴다.

## 3. UX/UI Agent 검토

적용 기준:

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

반영:

- 모바일에서는 desktop table을 억지로 유지하지 않고 card/list와 action sheet 성격의 흐름을 사용한다.
- 명함 스캔과 회의록 작성은 빠른 현장 입력을 막지 않아야 한다.
- 실패 안내는 해요체, 짧은 행동형 문구를 사용한다.
- 권한 거부, 미지원, OCR 실패는 사용자가 다음 행동을 바로 알 수 있어야 한다.

## 4. Software Agent 검토

적용 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

반영:

- API 계약은 `COMMON/API-SPEC`에 둔다.
- BusinessCard safe failure 필드는 Prisma migration으로 추가하되 provider raw detail은 저장하지 않는다.
- 외부 OCR/STT provider 호출은 DB transaction 안에서 오래 실행하지 않는다.
- FE local draft는 서버 상태가 아니므로 TanStack Query에 넣지 않는다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- analytics failure는 제품 기능 실패로 전파하지 않는다.

## 5. 주요 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 모바일 camera capture 브라우저별 차이 | `capture`는 progressive enhancement로 보고 데스크톱/미지원은 파일 업로드 유지 |
| iOS Safari MediaRecorder 차이 | 지원 탐지 후 미지원이면 음성 파일 업로드 fallback |
| local draft 민감정보 장기 보관 | 24시간 TTL, 저장 완료/버림/만료 삭제, 이미지/audio blob 저장 금지 |
| OCR provider raw error 노출 | safe error code/message만 user response와 FE에 전달 |
| push 자동 opt-in 정책 위험 | 명시 클릭 기반 browser permission, service/marketing notification 분리 |
| analytics payload PII 유입 | event별 allowlist와 PII key 차단, payload raw logging 금지 |

## 6. 구현 전 blocking

- G02 DB migration은 `NBA-014` DB/Prisma 운영 gate를 반드시 먼저 확인한다.
- G06 analytics event 확장은 09 event taxonomy와 collector 금지 field 정책을 깨면 안 된다.
- G05 push 권한 UX는 회원가입 약관 동의를 browser permission으로 대체하면 안 된다.
