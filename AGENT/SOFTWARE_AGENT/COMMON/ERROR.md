# Error Handling Notes

이 문서는 QA 중 발견한 에러 처리 개선 항목을 기록한다. 현재 릴리즈 판단을 막는 S0/S1/S2 버그가 아니라, 운영성과 디버깅을 높이는 후속 개선 항목을 모은다.

## 1. 기본 원칙

- 사용자 화면에는 내부 provider, quota, billing, API key, stack trace를 노출하지 않는다.
- 사용자에게는 짧고 행동 가능한 일반 안내만 보여준다.
- 서버 로그에는 원인 분류에 필요한 최소 메타데이터만 남긴다.
- API key, token, 이미지 원본, OCR 원문, 회의록 원문, private memo, 딜 금액 원문은 로그에 남기지 않는다.
- 외부 provider 장애는 앱 전체 실패가 아니라 해당 기능 실패 상태로 격리한다.

## 2. 명함 OCR 429 사례

발견일: 2026-07-09

상황:

- 명함 OCR QA 중 OpenAI Responses API가 `429 insufficient_quota`를 반환했다.
- User Web은 `자동 입력에 실패했어요. 이미지는 저장하지 않았어요.` 안내를 표시했다.
- 이미지는 저장하지 않았고, 앱은 깨지지 않았다.
- 결제/quota 처리 후 OCR 성공 케이스가 통과했다.

판단:

- 기능 안전성은 정상이다.
- 원인은 코드 실패가 아니라 외부 provider quota/billing 상태였다.
- 현재 개선 필요 지점은 사용자 UX가 아니라 서버 로그와 내부 에러 분류다.
- 심각도는 S3 운영/관측성 개선으로 본다.

## 3. 사용자 노출 문구

현재 방향:

```text
자동 입력에 실패했어요. 이미지는 저장하지 않았어요.
```

후속 개선 시 권장 문구:

```text
자동 입력에 실패했어요. 잠시 후 다시 시도해 주세요. 이미지는 저장하지 않았어요.
```

사용자에게 노출하지 않을 표현:

- `insufficient_quota`
- `rate_limit_exceeded`
- `billing`
- `API key`
- `OpenAI quota`
- provider raw error message

## 4. 서버 로그 분류 기준

OpenAI provider 실패 시 서버 로그에 아래 값을 남긴다.

```text
event
provider
operation
statusCode
providerErrorType
providerErrorCode
retryable
category
requestId
scanLogId
```

로그에 남기지 않을 값:

```text
OPENAI_API_KEY
Authorization header
이미지 원본/base64
OCR raw response 전문
사용자 private memo
회의록 원문
```

## 5. Provider 에러 분류

| 조건 | category | retryable | 운영 판단 |
| --- | --- | --- | --- |
| `401`, `403` | `provider_auth_error` | false | API key 또는 권한 설정 확인 |
| `429` + `insufficient_quota` | `provider_quota_exceeded` | false | billing/quota/project 연결 확인 |
| `429` + `rate_limit_exceeded` | `provider_rate_limited` | true | 잠시 후 재시도 가능 |
| `400` + invalid image/request | `provider_bad_request` | false | 요청 payload, 이미지 형식, 모델 파라미터 확인 |
| `5xx` | `provider_unavailable` | true | provider 일시 장애로 보고 재시도 가능 |
| JSON parse/schema mismatch | `provider_response_invalid` | false | response schema/prompt/model 호환성 확인 |

## 6. 후속 구현 메모

우선 적용 대상:

1. `BE/src/modules/business-card/infrastructure/providers/openai-business-card-ocr.provider.ts`
2. `BE/src/modules/business-card/application/services/business-card-application.service.ts`

개선 방향:

- OpenAI 실패 응답 JSON을 안전하게 파싱한다.
- `error.type`, `error.code`, HTTP status를 내부 에러 객체에 담는다.
- `insufficient_quota`와 `rate_limit_exceeded`를 구분한다.
- application log에는 category와 retryable만 남긴다.
- API 응답은 기존처럼 `OCR_FAILED` 상태를 유지한다.

확장 대상:

- MeetingNote AI draft
- MeetingNote STT draft
- DataImport AI column mapping

## 7. QA 기록 방식

외부 provider 문제로 실패하면 다음처럼 기록한다.

```text
상태: BLOCKED 또는 N/A
원인: 외부 provider quota/billing/rate limit
사용자 화면: 일반 실패 안내 표시
데이터 안전성: 원본 이미지/민감 데이터 미저장 또는 미노출
후속: provider 설정 정상화 후 재검증
```

provider 설정 정상화 후 성공하면 QA 결과에 성공 케이스 통과와 이전 provider 장애 처리 확인을 함께 남긴다.
