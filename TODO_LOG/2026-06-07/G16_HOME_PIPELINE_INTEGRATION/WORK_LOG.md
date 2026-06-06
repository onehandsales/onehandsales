# G16 Home Pipeline Integration

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`

## 요구사항 체크
- 홈(`/`) 첫 화면을 딜 파이프라인 중심으로 구성한다.
- 단계 탭은 전체, 초기 접촉, 논의 중, 수주, 실주를 제공한다.
- 데스크톱은 리스트/테이블과 우측 상세 패널을 함께 제공한다.
- 모바일은 단계 탭과 카드 리스트를 우선한다.
- 일정, 후속 조치 요약, 최근 회의록 placeholder를 보조 영역으로 둔다.
- `GET /api/deals`, `GET /api/deals/:dealId`, `PATCH /api/deals/:dealId/stage` 흐름을 연결한다.
- 빈 상태, 필터 결과 없음, API 실패 재시도, 단계 변경 낙관적 업데이트/롤백을 검토한다.

## 작업 로그
- G16 기준 문서와 기존 Deal 리스트/상세 구현을 재확인했다.
- 홈의 기존 mock 파이프라인 화면을 실제 API 기반 파이프라인 화면으로 교체하는 방향으로 진행한다.
- `DealPipelineHomeScreen`을 추가해 `/` 첫 화면을 `GET /api/deals` 기반 파이프라인으로 교체했다.
- 단계 탭, 데스크톱 리스트/우측 상세 패널, 모바일 카드 리스트를 홈에 연결했다.
- 홈 리스트/카드에서 `PATCH /api/deals/:dealId/stage` 단계 변경을 제공하고, 실패 시 낙관적 변경을 롤백하도록 처리했다.
- 오늘 일정, 후속 조치, 최근 회의록 보조 영역을 홈 하단에 배치했다.
- 빈 상태 CTA, 필터 결과 없음 reset, API 실패 retry 상태를 추가했다.

## 검토
- `AGENT`/`TODO` 기준으로 홈 첫 화면이 딜 파이프라인을 우선하도록 확인했다.
- `/deals` 전용 목록/상세 화면은 유지하고, 홈만 전용 파이프라인 화면으로 교체했다.
- 데스크톱 테이블은 금액을 축약 표기해 주요 열이 잘리지 않도록 조정했다.
- 모바일 카드에서는 제목/거래처와 단계 셀렉트가 서로 밀리지 않도록 세로 배치로 보정했다.

## 검증
- `pnpm run typecheck` 통과
- `pnpm run lint` 통과
- `pnpm run build` 통과
- `git diff --check` 통과
- Playwright API mock 스모크 통과
  - 데스크톱 `/`: 단계 탭, 리스트, 우측 상세 패널, 성공 단계 변경 확인
  - 데스크톱 `/`: 단계 변경 실패 시 오류 노출과 원래 단계 롤백 확인
  - 모바일 `/`: 단계 탭과 카드 리스트 우선 렌더링 확인
  - 스크린샷: `/tmp/g16-home-desktop.png`, `/tmp/g16-home-mobile.png`
