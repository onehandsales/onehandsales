# Time And Timezone Policy

현재 사용자 프로필·인증·시스템 audit의 시각 처리 기준이다. folk의 업무 날짜·기한 정책은 아래 전환 경계에 따라 별도로 확인한다.

## 저장 원칙

- DB의 instant 값은 UTC 기준 `DateTime @db.Timestamptz(3)`로 저장한다.
- 사용자가 선택한 기본 timezone은 `User.timeZone`에 IANA timezone ID로 저장한다.
- 사용자-facing 날짜/시간 표시는 브라우저 locale과 `User.timeZone`을 우선해 변환한다.
- 서버 내부 비교와 만료 계산은 UTC instant 기준으로 처리한다.

## 입력 원칙

- 프로필의 timezone 값은 IANA timezone ID allow-list 또는 런타임 검증을 거친다.
- 사용자 기본 국가/통화/locale은 프로필 API에서 검증한다.
- API request가 local date-time을 받을 경우 timezone metadata를 별도 필드로 함께 받는다.

## 표시 원칙

- API 응답의 `createdAt`, `updatedAt`, `deletedAt`은 UTC ISO string으로 간주한다. 현재 `deletedAt`은 User 계정 상태 필드에만 남는다.
- Frontend는 UTC string을 그대로 렌더링하지 않고 사용자 표시 기준으로 변환한다.
- 세션 만료와 최근 활동 표시는 같은 formatter를 공유한다.

## folk 전환 경계

- `User.timeZone` 표시 기준을 Tasks의 오늘/지연 분류, 반복, 알림 계산에 일괄 적용하지 않는다. 공식 Tasks 문서에는 Workspace timezone을 사용하는 설명과 사용자 시간대 표현이 함께 있다.
- [F16 조사 및 미확인 사항](../../UXUI_AGENT/PLANNING/FOLK_BENCHMARK_RESEARCH.md)에 따라 화면·알림 동작을 대조하고, [DB 전환안](FOLK_SCHEMA_PLAN.md)에서 업무별 시간대 계약을 정한다. 현재 Workspace에 시간대 설정이 구현되었다는 뜻은 아니다.
- 날짜만 있는 값과 특정 시점을 나타내는 instant를 구분한다. 모든 커스텀 날짜 필드·작업 기한을 UTC timestamp로 일괄 변환하는 설계를 이 문서만으로 확정하지 않는다.
