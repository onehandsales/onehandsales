# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| Timeline 조회 | 딜 상세에서 활동을 시간순으로 조회 |
| 자동 activity | 단계 변경, 회의록 연결, 일정 연결 후보 |
| 수동 activity | 사용자가 직접 활동 기록 추가 |
| Activity type | call, meeting, email, stage change 등 |
| Summary | 목록/홈에 최신 activity를 보여줄 수 있는 기반 |
| Deal list products summary | 딜 목록에서 연결 제품을 빠르게 비교 |
| Contact dealCount | 담당자 목록에서 연결 딜 수 표시 |
| latest activity/next action summary | 회사/담당자/제품/딜/회의록 목록 summary |
| 검색/필터 고도화 | 고급 필터, 정렬, 최근 항목, 진행 중 딜 우선 |
| page size/pagination 계약 | FE/BE/test page size와 pagination contract 정리 |
| 딜 가능성/확률 | 긍정/중립/부정 이후 확률/예상 매출 후보 |
| 다음 행동 고도화 | 완료, 미루기, 일정 생성, follow-up 연결 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 팀 협업 댓글 | 개인 영업자 B2C 우선 |
| 모든 도메인 공통 activity bus | 1차는 Deal 중심 |
| AI activity 자동 판단 | 05/07 이후 후보 |

## 구현 전 세부 확인 질문

- 기존 memo/following action log를 그대로 두고 activity가 참조할지?
- 단계 변경 시 기존 데이터에도 backfill이 필요한가?
- activity 원문에 민감정보가 들어갈 때 마스킹 기준은?
- 삭제/복구 시 activity도 휴지통에 들어가야 하는가?
- products summary, dealCount, latest summary를 list response field로 둘지 summary endpoint로 둘지?
- 고급 검색/필터를 도메인별 API에 넣을지 통합검색에 넣을지?
- page size 15 계약을 전체 목록에 일괄 적용할지?
- 딜 가능성/확률은 기존 가능성 필드를 확장할지 새 score 모델로 둘지?

## 완료 기준 초안

- 딜 상세에서 timeline을 볼 수 있다.
- 단계 변경 또는 회의록 연결 activity가 자동 생성된다.
- 사용자 소유 딜 activity만 조회된다.
- summary가 private memo를 노출하지 않는다.
- 목록 summary/count는 user ownership과 soft delete 제외 기준을 지킨다.
- 검색/필터/pagination 계약이 FE/BE/test에서 일치한다.
- 딜 가능성/확률 고도화 범위가 확정되어 있다.
