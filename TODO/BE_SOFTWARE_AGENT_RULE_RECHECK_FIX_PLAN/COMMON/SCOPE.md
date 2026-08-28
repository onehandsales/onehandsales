# Scope

상태: Ready / Maintenance

## 1. 범위 원칙

이 계획은 신규 기능 구현이 아니라 Backend Agent 규칙 재검토 결과를 수정하는 유지보수 작업이다.

핵심 기준은 다음이다.

- Backend 아키텍처 경계 준수
- Prisma/Nest/Provider 의존 위치 준수
- API-SPEC, DTO, mapper, FE client 계약 정합성
- transaction, observability, audit log 기준 준수
- Backend 한글 주석 규칙 준수

## 2. 포함 범위

| 항목 | 내용 |
| --- | --- |
| P1 architecture | presentation의 Prisma enum 직접 의존 제거 |
| P1 module boundary | sales-report application의 schedule repository 직접 의존 제거 |
| P2 observability | AI Weekly Report 조회 이벤트 계약과 구현 일치 |
| P2 API contract | AI Weekly Report `summaryPreview` 계약 정합화 |
| P2 comments | 수정 대상 Backend class/interface/type/method/helper 한글 주석 보강 |
| P3 environment | bootstrap `process.env` 정책 충돌 정리 |
| P3 docs | API-SPEC 템플릿 누락 문서 감사와 후속 분리 |
| P3 presentation audit | presentation의 repository projection type 의존 감사 |

## 3. 제외 범위

- DB schema 변경
- 적용된 Prisma migration 수정/삭제
- 신규 API 경로 추가
- AI 프롬프트 품질 개선
- 결제/Paddle/Billing 작업
- Admin/B2B 신규 기능
- 대량 리팩터링
- 사용자가 요청하지 않은 커밋

## 4. 공통 코드 규칙

- `domain`은 NestJS, Prisma, HTTP, OpenAI, Supabase, logger를 import하지 않는다.
- `application`은 Prisma와 provider SDK를 직접 호출하지 않는다.
- `infrastructure`는 Prisma repository, provider adapter, Nest module provider 구현을 담당한다.
- `presentation`은 controller, DTO, guard, decorator, response mapper만 담당한다.
- controller는 application service만 호출한다.
- 다른 모듈의 repository port를 직접 import하지 않는다.
- 사용자 소유 데이터는 `userId` ownership 필터를 가진다.
- Admin API는 `/admin/api/*`, AuthGuard, AdminGuard, masking, audit log 기준을 다시 확인한다.
- 로그에는 개인정보, 민감 메모, meeting note 본문, provider prompt/raw response, token을 남기지 않는다.

## 5. 유지보수 한글 주석 필수 규칙

Backend 코드를 새로 작성하거나 수정할 때는 아래 규칙을 반드시 지킨다.

- class 바로 위에 `// 역할 : ...` 한글 주석을 작성한다.
- interface/type/port 바로 위에 `// 역할 : ...` 한글 주석을 작성한다.
- API controller method 바로 위에 `// API : ...` 한글 주석을 작성한다.
- 내부 public/private method와 helper 바로 위에 `// 기능 : ...` 한글 주석을 작성한다.
- application orchestration method 내부에는 필요한 경우 `// 1. ...`, `// 2. ...` 형태의 한글 단계 주석을 작성한다.
- 수정 범위 안의 기존 영어 주석 또는 누락 주석은 한글 규칙에 맞춘다.
- 단순 import/type 변경만 해도 변경 영향이 있는 class/method의 주석 누락 여부를 확인한다.

예시:

```ts
// 역할 : 관리자 감사 이력 응답을 HTTP 응답 DTO로 변환합니다.
export class AdminAuditResponseMapper {
  // 기능 : 감사 이력 목록을 관리자 화면 응답 형식으로 변환합니다.
  toListResponse(...) {
    // 1. 화면에서 필요한 값만 추출한다.
    // 2. 날짜와 상태 값을 응답 계약에 맞게 직렬화한다.
  }
}
```

