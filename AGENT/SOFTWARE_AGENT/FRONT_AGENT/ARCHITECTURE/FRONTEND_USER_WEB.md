# User Web 구조와 의존 방향

기준일: 2026-11-20 KST. 현재 소스와 신규 개발 기준을 구분한다.

## 1. 현재 기술과 실행 구조

[package.json](../../../../FE/user-web/package.json)의 선언은 React 19·TypeScript·Vite 7·React Router 7·TanStack Query 5·React Hook Form 7·Zod 4·Tailwind 3이다. 정확한 설치 버전은 lockfile 기준이며 문서의 major 표기는 업그레이드 지시가 아니다.

G01에서 [router](../../../../FE/user-web/src/app/router/router.tsx)를 공개·가상 인증·내부·공유 최소 경계로 교체했다. [provider](../../../../FE/user-web/src/app/providers/app-providers.tsx)는 메모리 runtime만 조립하며 실제 인증을 호출하지 않는다. [현재 구조](../../../../FE/user-web/ARCHITECTURE.md)와 [검토 결과](../../../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md)를 따른다.

## 2. 신규 기능의 권장 배치

다음은 기능이 커질 때의 배치 예다. 기능 이름과 모든 하위 폴더를 미리 만들 필요는 없다. 기존 `components/ui`, `lib`, `features`, `pages`를 활용하며 전역 폴더 개편을 전제하지 않는다.

```text
src/
  app/                         라우터·provider·데이터 모드 조립
  pages/<route>/               페이지 진입·레이아웃·기능 조합
  features/<feature>/
    components/                업무 UI
    hooks/                     query·mutation·상태 조정
    model/                     기능 타입·검증·순수 계산
    data/                      계약·query key·adapter
      <feature>-data-source.ts
      mock-<feature>-data-source.ts
      http-<feature>-data-source.ts   실제 연동 단계에서 추가
    index.ts                   외부에서 사용할 공개 export
  components/ui/               업무 중립 UI
  lib/                         공통 기술 도구(필요할 때만)
  mocks/                       기능 사이 fixture 저장소·seed·시나리오 조립
```

테스트는 검증 대상 가까이에 두거나 기존 테스트 구조를 따른다. 기능 전용 mock은 해당 feature에 두고, 여러 기능이 공유하는 원본 데이터만 공통 mock 저장소에서 관리한다.

## 3. 의존 방향

| 호출자 | 허용하는 의존 | 금지하는 의존 |
| --- | --- | --- |
| app | pages, feature 공개 API, 공통 provider, adapter 조립 | 업무 상태 전부를 앱 전역에 구현 |
| pages | feature 공개 API, 공통 UI | 다른 page의 내부 구현 |
| feature UI / hook | 같은 feature 모델·계약, 공통 UI·기술 도구 | 구체 fixture·HTTP 구현의 직접 선택 |
| feature adapter | 같은 기능 계약, mock store 또는 API client | page, JSX, toast, route 조작 |
| shared UI / lib | 더 낮은 공통 도구 | 업무 feature·page 역참조 |

서로 다른 feature는 원칙적으로 page에서 조합한다. 필요한 공개 타입·기능을 의존할 때에는 방향과 소유자를 명시하고 순환 참조를 만들지 않는다. `index.ts`를 모든 내부 export의 집합으로 만들지 않는다. 동일 feature 내부에서는 내부 파일을 직접 참조하여 공개 barrel 순환을 피한다.

User Web과 Admin Web은 별도 앱이다. 경로 alias로 다른 앱 소스를 import하지 않는다. 공유 패키지는 실제 중복·배포·버전 관리 필요가 확인된 후 검토한다.

## 4. Route와 오류 경계

- 로그인 이후 내부 업무 route는 기존 `/app` 영역을 기본으로 한다. Bonsai 대상 경로는 원본 흐름과 링크 복원 요구로 정한다.
- G01은 명시적인 전면 교체로 종전 redirect 호환을 제거했다. 이후 route 변경은 영향과 복귀 정책을 기록한다. 신규 Bonsai 화면을 종전 범용 ID 구조에 맞추지 않는다.
- 신규 route는 직접 URL 진입·reload·뒤로가기·잘못된 ID·권한 제한을 처리한다.
- page/feature 경계에서 로딩·오류·재시도를 제공한다. 일부 패널 실패로 전체 앱 shell이 사라지지 않도록 한다.
- 렌더링 오류 경계와 요청 오류 처리를 구분한다. Error Boundary가 모든 비동기 이벤트 오류를 처리한다고 가정하지 않는다.
- 큰 편집기·무거운 보조 화면은 실제 번들 비용을 확인하고 route 또는 기능 단위 지연 로딩을 검토한다.

## 5. 기능 추가 절차

출처·상태표 → route와 컴포넌트 책임 → FE 내부 표시 타입과 mock → 기능 hook·UI → 웹 상호작용 검증 순서로 진행한다. 복잡한 framework나 service locator를 새로 도입하지 않고 typed provider/factory처럼 필요한 범위의 조립 방식을 선택한다.

상세는 [컴포넌트](../CONVENTION/COMPONENT_DESIGN.md), [상태](STATE_AND_DATA.md), [mock](MOCK_FIRST_DEVELOPMENT.md), [검증](TESTING.md)을 따른다.
