# API TODO

이번 계획의 API 변경 상태: 없음.

## 현재 사용 API

User Web은 기존 Backend `/api/*`를 사용한다.

이번 계획에서는 다음을 새로 추가하지 않는다.

- Notification API
- Admin API
- Payment/subscription API
- ImportJob persistence API
- Weekly report API
- Generic export API

## QA 중 확인할 수 있는 API 관련 UX 포인트

- 401이면 로그인 안내와 보호 route redirect가 자연스러운가
- 410 DeletedResource read는 삭제된 항목 안내로 보이는가
- 409 DeletedResource write는 복구 후 수정 안내로 보이는가
- provider failure는 내부 provider 정보를 숨기는가
- validation error는 사용자가 고칠 행동을 알려주는가
- 기존 response로 회사/담당자/제품/딜/일정/회의록 linked record 맥락을 화면에 표현할 수 있는가
- API 표현이 custom object/custom field builder처럼 오해되는 사용자 노출 구조를 만들지 않는가

## 별도 Backend 계획으로 분리할 조건

- API status/code/message가 FE UX를 안전하게 만들 수 없다.
- ownership isolation 문제가 있다.
- provider error가 내부 정보를 사용자에게 노출한다.
- field-level validation UX가 API 응답 구조 때문에 불가능하다.
- 고정 sales record 관계를 화면에 표현하는 데 필요한 핵심 linked record 정보가 API에 없다.

## G03 Deal Pipeline 확인 결과

- 상태: Deferred
- 확인일: 2026-07-18
- 화면: `/app/deals`

G03은 Deal API를 변경하지 않고 완료했다.

현재 Deal list response에는 `expectedEndDate`, `latestFollowingAction`, `nextFollowingAction`, `companies`, `contacts`가 있어 목록에서 마감일, 최근 활동, 다음 행동, 회사/담당자 linked record를 표현할 수 있다.

다만 Deal list response에는 `products`가 없다. 목록 row에서 제품 linked record까지 1급 정보로 보여야 한다고 판단되면 FE에서 임의로 만들지 말고 Deal list response에 제품 summary를 포함하는 API 변경 계획으로 분리한다.

Desktop page size 15개 기본값은 장기 UX 목표로 남긴다. 현재 page size는 Backend 도메인 서비스 상수, 응답 `pageSize`, 테스트/API 문서 계약과 연결되어 있으므로 FE 단독 변경하지 않는다.
