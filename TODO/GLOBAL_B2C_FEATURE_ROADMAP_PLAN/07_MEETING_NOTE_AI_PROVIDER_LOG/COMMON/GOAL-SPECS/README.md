# Goal Specs

상태: Ready
확정일: 2026-07-26

## 1. 목적

07 구현은 아래 goal 문서 단위로 진행한다. 구현자는 한 번에 전체를 수행하지 않고 현재 goal의 포함 범위와 완료 기준만 만족시킨다.

## 2. Goal 목록

| Goal | 문서 | 목적 |
|---|---|---|
| G01 | `G01_PLANNING_API_DB_CONTRACT.md` | 구현 전 코드/API/DB 계약 대조 |
| G02 | `G02_AI_PROVIDER_LOG_DB_PRISMA.md` | Provider log DB/Prisma 변경 |
| G03 | `G03_MEETING_NOTE_AI_LOG_BACKEND.md` | 기존 AI/STT draft API log/safe failure |
| G04 | `G04_MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_BACKEND.md` | 다음 행동/follow-up draft Backend |
| G05 | `G05_MEETING_NOTE_AI_USER_WEB.md` | 회의록 AI User Web UX |
| G06 | `G06_QA_REVIEW_CLOSEOUT.md` | QA/review/문서 closeout |

## 3. 공통 필수 조건

- 코드 작업 시 반드시 한글 주석을 추가한다.
- UX/UI는 `AGENT/UXUI_AGENT`를 따른다.
- Backend/Frontend/DB 구현은 `AGENT/SOFTWARE_AGENT`를 따른다.
- User API는 `/api/*`만 사용한다.
- Provider raw request/response, prompt 전문, transcript 전문, follow-up body 전문은 DB/log에 저장하지 않는다.
- AI는 후보와 초안만 만들고, 사용자가 확인하기 전 업무 데이터를 자동 변경하지 않는다.
