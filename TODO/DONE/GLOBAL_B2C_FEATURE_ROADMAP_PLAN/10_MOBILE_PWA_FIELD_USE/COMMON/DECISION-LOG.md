# Decision Log

상태: Confirmed
기준일: 2026-07-30

## 1. 확정 결정

| ID | 결정 | 내용 |
|---|---|---|
| M10-D01 | 1차 목표 | PWA 설치가 아니라 모바일 브라우저 현장 입력을 먼저 구현한다. |
| M10-D02 | 명함 촬영 방식 | `input type=file` + `accept="image/*"` + `capture="environment"`로 모바일 후면 카메라 호출을 유도한다. |
| M10-D03 | OCR 실패 계약 | `errorCode`, `userMessage`, `retryable` 안전 실패 계약을 만든다. provider raw error, quota, API key, prompt, stack trace는 사용자 응답 금지다. |
| M10-D04 | 회의록 음성 | `MediaRecorder` 기반 브라우저 녹음 UX를 만든다. 권한 거부/미지원 시 기존 음성 파일 업로드를 fallback으로 둔다. |
| M10-D05 | local draft 저장 위치 | 서버 DB가 아니라 FE local draft로 처리한다. IndexedDB를 1차 선택지로 둔다. |
| M10-D06 | local draft TTL | 24시간 TTL, 복원 확인 UX, `불러오기`/`버리기` 버튼을 사용한다. 저장 완료/버림/만료 시 삭제한다. |
| M10-D07 | 모바일 event | 모바일 필수 기능 품질 개선을 위해 최소 allowlist analytics event를 10에서 추가한다. |
| M10-D08 | native app | iOS와 Android native app은 필수 후속 로드맵이다. 10에서는 구현하지 않고 별도 필수 항목으로 승격한다. |
| M10-D09 | push 권한 | 02 Notification API를 재사용하고 모바일 permission UX만 보강한다. 회원가입/약관 동의로 browser push 권한을 자동 허용한 것으로 간주하지 않는다. |
| M10-D10 | 문서 수준 | 09와 같은 실행형 문서 구조를 만들고 `/goal` 단위로 처리한다. |

## 2. 정책 결정

- 앱 안 알림은 서비스 알림 기본 채널로 둘 수 있다.
- browser push는 사용자의 명시 클릭 이후 브라우저 권한 prompt를 띄운다.
- 서비스 알림과 마케팅/광고 알림은 분리한다.
- privacy/terms 동의 문구는 브라우저/OS permission을 대체하지 않는다.
- mobile analytics는 필요성 검증이 아니라 품질/실패율/개선 우선순위 판단용이다.

## 3. 구현 전 승격 규칙

- 각 goal은 `COMMON/GOAL-SPECS/G*.md` 하나만 구현 범위로 삼는다.
- API가 포함된 goal은 `COMMON/API-SPEC/*` 계약 상태가 `confirmed`인지 확인한다.
- DB 변경 goal은 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts`, `COMMON/PRISMA-MIGRATION-SPEC.md`를 먼저 읽는다.
- UX/UI 변경 goal은 `AGENT/UXUI_AGENT` 기준을 먼저 읽는다.
- Software 변경 goal은 `AGENT/SOFTWARE_AGENT` 기준을 먼저 읽는다.
- 모든 goal은 완료 전 `COMMON/GOAL-REVIEW-CHECKLIST.md`와 각 goal의 `Goal 검토 체크리스트`를 확인한다.
