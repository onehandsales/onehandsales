# API Spec

이번 `USER_WEB_UXUI_COMMON_QA_PLAN`은 새 API를 추가하지 않는다.

## 기준

- User Web은 기존 `/api/*`만 호출한다.
- User Web에서 `/admin/api/*`를 호출하지 않는다.
- Admin 운영 API, Notification API, 결제/구독 API는 이번 계획 범위가 아니다.
- 화면 계약은 `Notion + Attio` 기준의 고정 sales record 관계와 충돌하지 않아야 한다.
- 기존 API 응답으로 회사/담당자/제품/딜/일정/회의록 linked record 맥락을 표현할 수 있는지 확인한다.
- UX/UI QA 중 API response shape, error code, ownership, provider error 처리가 부족하다고 판단되면 이 계획에서 임의 수정하지 않고 별도 Backend/API 계획을 만든다.

## 예외

아래 이슈가 발견되면 별도 BE 계획으로 분리한다.

- 다른 사용자 데이터가 노출된다.
- Search, Trash, Export에 ownership 문제가 있다.
- 삭제된 리소스 접근 error code가 FE에서 안전하게 처리되지 않는다.
- OCR/AI/STT/Import mapping provider failure가 사용자에게 내부 provider 정보를 노출한다.
- API validation error가 field-level UI를 만들 수 없을 정도로 모호하다.

## G03 Deal List Contract Note

- 확인일: 2026-07-18
- 관련 화면: `/app/deals`

Deal list response의 `expectedEndDate`, `latestFollowingAction`, `nextFollowingAction`, `companies`, `contacts`는 G03의 마감일, 최근 활동, 다음 행동, 회사/담당자 linked record 표현에 충분하다.

Deal list response에는 `products`가 없으므로 목록 row에서 제품 linked record를 직접 보여주는 것은 현재 API 계약 밖이다. 필요하면 별도 Deal list response 확장으로 분리한다.

Desktop page size 15개 기본값은 FE 단독 변경 대상이 아니다. Backend 상수, 응답 `pageSize`, 관련 테스트/API 문서와 함께 변경해야 한다.
