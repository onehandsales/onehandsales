# User Web 프론트엔드 컨벤션

이 문서는 `FE/user-web` 개발 시 지켜야 할 코드 작성 규칙을 정의한다. 모든 문서는 한글로 작성한다.

## 1. 파일과 폴더 이름

- 폴더와 파일 이름은 `kebab-case`를 사용한다.
- React 컴포넌트 파일은 `deal-card.tsx`, `contact-form.tsx`처럼 의미가 드러나게 짓는다.
- 도메인 feature 폴더는 단수형을 사용한다. 예: `deal`, `contact`, `company`, `product`, `meeting-note`.
- 페이지 폴더는 라우트와 맞춰 복수형을 사용할 수 있다. 예: `pages/deals`, `pages/contacts`.

## 2. TypeScript 기준

- `strict`를 켠다.
- `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`를 유지한다.
- API 응답, 폼 값, 도메인 엔티티 타입은 명시적으로 선언한다.
- `any`는 금지한다. 외부 응답을 바로 믿지 말고 Zod 스키마나 명시 타입을 둔다.
- 공통 타입은 `src/types`, 도메인 타입은 `src/features/<domain>/types`에 둔다.

## 3. React 작성 규칙

- 컴포넌트는 함수형 컴포넌트만 사용한다.
- 페이지 컴포넌트는 조립만 담당하고 API 호출과 복잡한 상태 처리를 직접 소유하지 않는다.
- 기능별 UI는 `features/<domain>/components`에 둔다.
- 도메인 없는 순수 UI는 `components/ui`, 레이아웃은 `components/layout`에 둔다.
- 불필요한 전역 상태를 만들지 않는다.

## 4. 데이터 호출과 서버 상태

- 서버 상태는 TanStack Query로 관리한다.
- API 함수는 `features/<domain>/api` 안에 둔다.
- API 클라이언트는 `src/lib/api-client.ts`를 통해서만 사용한다.
- Query Key는 도메인별 파일로 분리한다. 예: `deal-query-keys.ts`.
- mutation 이후에는 관련 Query Key를 명확히 invalidate한다.

## 4.1. 시간과 Timezone 표시

시간과 timezone 처리는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

- Backend가 내려주는 `createdAt`, `updatedAt`, 일정 `startAt`, `endAt` 같은 instant는 UTC ISO string으로 본다.
- 화면에는 UTC string을 그대로 출력하지 않고 일정/사용자/조직 timezone으로 변환해 표시한다.
- 일정 월간/주간 범위 계산은 선택된 표시 timezone 기준으로 한다.
- 일정 생성/수정 form은 사용자가 입력한 날짜와 24시간제 시간을 local date-time으로 보내고 IANA `timeZone`을 함께 보낸다.
- 일정 생성/수정 request에서 사용자 입력 local date-time을 `toISOString()`으로 UTC 변환해 보내지 않는다.
- 날짜만 필요한 `YYYY-MM-DD` 값은 timezone 변환 없이 표시한다.

## 5. 폼과 검증

- 폼은 React Hook Form을 기준으로 한다.
- 검증은 Zod를 기준으로 한다.
- Zod 스키마는 `features/<domain>/schemas`에 둔다.
- 서버 에러 메시지는 사용자에게 바로 노출하기 전에 표시 가능한 메시지로 변환한다.

## 6. 클라이언트 상태

- 화면 내부 상태는 `useState`, `useReducer`, React Hook Form으로 관리한다.
- 서버 데이터 캐시는 Zustand에 넣지 않는다.
- Zustand는 여러 페이지에서 공유되는 UI 상태가 실제로 필요할 때만 `src/store`에 둔다.

## 7. import 순서

```ts
// 1. React와 외부 라이브러리
// 2. @/app/*
// 3. @/pages/*
// 4. @/features/*
// 5. @/components/*
// 6. @/hooks/*
// 7. @/lib/*
// 8. @/store/*
// 9. @/types/*
// 10. @/utils/*
// 11. 상대 경로
```

경로 alias는 `@/*`를 기준으로 한다.

## 8. 스타일과 UI

- Tailwind CSS를 기본 스타일링 도구로 사용한다.
- 기본 UI 폰트는 Notion-like 다국어 스택을 기준으로 한다: `Inter`, `Pretendard Variable`, `Pretendard`, `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Apple SD Gothic Neo`, `Noto Sans KR`, `Noto Sans CJK KR`, `PingFang TC`, `PingFang SC`, `Microsoft JhengHei`, `Microsoft YaHei`, `Hiragino Sans`, `Hiragino Kaku Gothic ProN`, `Yu Gothic`, `Meiryo`, `Noto Sans TC`, `Noto Sans SC`, `Noto Sans JP`, `sans-serif`.
- 이 폰트 기준은 한국어, 일본어, 대만 번체 중국어, 영어 US/UK/Singapore/Australia/Canada 전체에 적용한다.
- 영어/라틴 문자는 `Inter`를 우선하고, 한국어는 `Pretendard` 계열 fallback, 대만 번체 중국어/일본어는 OS CJK 시스템 폰트 fallback을 사용한다.
- 서비스의 주된 디자인 색상은 `#1F4EF5`, `#4880EE`, `#83B4F9`를 기준으로 한다.
- 주요 CTA, 선택 상태, 활성 탭, 포커스, 핵심 피드백은 위 blue palette 안에서 먼저 해결하고 임의의 다른 blue/purple 계열을 추가하지 않는다.
- blue 계열의 채움형 UI는 테두리도 채움색과 동일한 단색으로 맞춘다. 예: `bg-[#1F4EF5] border-[#1F4EF5]`, `bg-[#4880EE] border-[#4880EE]`.
- 확인/완료처럼 단색 배지를 쓰는 경우 내부에 별도 원형 레이어를 넣지 말고 단색 배경과 아이콘만 사용한다.
- 삭제 버튼은 수정 버튼 바로 옆에 빨간 휴지통 아이콘으로 배치한다.
- 삭제 클릭 시 브라우저 `window.confirm`을 사용하지 않고 중앙 `ConfirmDialog`를 사용한다.
- 삭제 확인 문구는 `데이터를 삭제하시겠습니까?`, 버튼은 `아니요`, `예`를 사용한다.
- 삭제 성공 알림은 오른쪽 하단 토스트가 아니라 중앙 모달형 `Toast`로 표시한다.
- 삭제 성공 제목은 `삭제가 완료되었습니다.`, 보조 문구는 `7일안으로 휴지통에서 복구가 가능합니다.`를 사용한다.
- 아이콘은 가능한 한 `lucide-react`를 사용한다.
- 공통 UI 컴포넌트는 `components/ui`에 둔다.
- 업무 화면은 정보 밀도와 스캔 가능성을 우선한다.
- 업무 화면은 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`의 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`를 기준으로 구성한다.
- 목록 row/card는 열 수 있는 record처럼 동작하고, 상세는 property-first detail과 linked record, activity/Memo 맥락을 분명히 보여준다.
- 기존 목록은 이미 record table 구조에 가까우므로 새 구조로 갈아엎기보다 row density와 연결 record/다음 행동/현재 응답에서 가능한 최근 활동 같은 업무 판단 정보 표현을 개선한다.
- 최근 활동 또는 다음 행동 summary가 현재 list response에 없으면 FE에서 임의 값처럼 꾸미지 않고 BE/API 후속으로 기록한다.
- 데스크톱 record row는 15개 목록이 한 화면에 들어가기 쉽도록 48px 수준의 업무용 밀도를 우선 검토한다.
- page size를 바꾸려면 FE 숫자만 수정하지 말고 Backend 상수, 응답 `pageSize`, API/DB 문서, 테스트 계약을 함께 확인한다.
- 모바일 record list도 현재 page size 계약은 15개이며, desktop table 대신 card/list로 표현한다.
- 페이지 섹션을 불필요한 카드로 감싸지 않는다.
- 도메인 생성 UX가 목록 맥락을 유지해야 할 때는 중앙 모달보다 오른쪽 문서형 패널을 우선 검토한다.
- 문서형 생성 패널은 데스크톱에서 viewport 최상단~최하단에 붙이고, 사용자가 좌우 resize할 수 있게 한다.
- 생성 패널이 열려도 목록 table의 비교 컬럼을 숨기거나 합치지 않는다. 공간이 부족하면 table 영역의 horizontal scroll로 대응한다.
- 작은 화면에서는 같은 form을 overlay panel 또는 모바일 친화 layout으로 전환해 목록과 입력이 서로 겹치지 않게 한다.

## 9. 환경 변수와 설정

- Vite 환경 변수는 `VITE_` prefix를 사용한다.
- 환경 변수 접근은 `src/lib/env.ts`를 통한다.
- 환경 변수 정본은 앱 디렉터리의 `.env`와 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. Vite가 로컬 override 파일을 읽을 수 있더라도, 공유 변수명과 용도는 공통 환경 문서에 문서화한다.
- API base URL, Supabase 공개 키처럼 브라우저에 노출 가능한 값만 FE 환경 변수로 둔다.

## 10. 접근성

- 버튼에는 명확한 텍스트 또는 `aria-label`을 둔다.
- 입력 컴포넌트는 label과 에러 메시지를 연결한다.
- 모달, 문서형 패널, 드롭다운, 토스트는 키보드 접근을 고려한다.
- 색상만으로 상태를 구분하지 않는다.

## 11. 금지 사항

- 페이지에서 `fetch`를 직접 호출하지 않는다.
- 사용자 웹에서 관리자 API를 호출하지 않는다.
- `features` 사이의 내부 파일을 깊게 import하지 않는다. 필요한 export는 `index.ts`를 통해 공개한다.
- 도메인 없는 공통 폴더에 특정 도메인 로직을 넣지 않는다.
- 전역 상태에 서버 응답 전체를 복제하지 않는다.

## 12. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
