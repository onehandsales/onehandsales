# /goal G09 BE Contact Deal List

## /goal 입력문

아래 문서를 먼저 읽고, 담당자 단건 상세 페이지에서 사용할 담당자 연결 딜 전체 목록 API를 추가해줘.

필수 참고 문서:

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/CONTACT_DEAL_LIST_API.md`

## 목표

`GET /api/contacts/:contactId/deals` API를 추가해 해당 담당자에 연결된 딜 전체 목록을 반환한다.

## 구현 범위

- `BE/src/modules/contact/presentation/http/contact.controller.ts`
- `BE/src/modules/contact/application/ports/contact.repository.ts`
- `BE/src/modules/contact/application/services/contact-application.service.ts`
- `BE/src/modules/contact/infrastructure/persistence/prisma-contact.repository.ts`
- 필요 시 Contact 응답 타입 또는 mapper
- controller/application 테스트
- 관련 API 계약 문서 상태 갱신

## API 계약

- Method: `GET`
- Path: `/api/contacts/:contactId/deals`
- 인증: Backend App access token
- 권한: 본인 담당자에 연결된 딜만 조회
- 페이지네이션: 없음
- 정렬: `createdAt DESC`, `id DESC`

응답:

```json
{
  "items": [
    {
      "id": "deal-id",
      "dealName": "딜 이름",
      "dealCost": 1000000,
      "createdAt": "2026-06-12T00:00:00.000Z"
    }
  ]
}
```

## 비즈니스 규칙

- `contactId`가 현재 사용자 소유 담당자인지 먼저 확인한다.
- 딜 조회 조건은 `contactId`와 현재 사용자 `userId`를 모두 포함한다.
- 응답에는 `id`, `dealName`, `dealCost`, `createdAt`만 포함한다.
- 연결된 딜이 없으면 `items: []`를 반환한다.

## 구현 제한

- 기존 `GET /api/contacts/:contactId` 응답은 변경하지 않는다.
- 기존 Deal 목록 API는 변경하지 않는다.
- Frontend 화면은 이 goal에서 변경하지 않는다.
- 페이지네이션, 검색, 필터를 추가하지 않는다.

## 검증

필수 검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

동작 검증:

- 본인 담당자에 연결된 딜 목록만 반환한다.
- 연결된 딜이 없으면 빈 배열을 반환한다.
- 다른 사용자 담당자 ID는 `ContactNotFound`로 처리한다.
- 정렬은 `createdAt DESC`, `id DESC` 기준이다.

## 완료 보고

- 변경한 파일
- 추가한 API와 응답 shape
- 실행한 검증 명령과 결과
- 남은 리스크 또는 후속 작업
