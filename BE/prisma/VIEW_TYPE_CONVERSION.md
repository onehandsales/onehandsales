# 기존 View를 TABLE·KANBAN·LIST로 전환

2026-11-01 사용자 승인에 따른 실제 저장 데이터 전환이다. `schema.prisma`의 ViewDefinition과 표시·필터·정렬·그룹·위젯 FK를 검토하고, 기존 영업 샘플 Workspace의 24개 View 중 나머지8타입을 전환한다. 일반 사용자 설정 초기화나 전체 환경에 적용할 schema migration이 아니다.

## 전환 내용

| 기존 타입 / 이름 | 새 타입 / 이름 |
| --- | --- |
| TIMELINE / 제품 평가 일정 | TABLE / 제품 평가 일정표 |
| GALLERY / 제품 카드 | LIST / 제품 목록 |
| CALENDAR / 영업 일정 | LIST / 영업 일정 목록 |
| MAP / 타깃 계정 지도 | TABLE / 타깃 계정·거점 목록 |
| GANTT / 업무 진행 계획 | TABLE / 업무 진행표 |
| CHART / 단계별 예상 금액 | KANBAN / 단계별 영업기회 |
| PIVOT / 회사·단계별 집계 | TABLE / 회사·단계별 영업기회 |
| DASHBOARD / 영업 현황 | LIST / 영업 현황 목록 |

전환 후 예상값은 TABLE18 / KANBAN2 / LIST4, 총24개다. 각 View ID·Workspace·Object/List 소속·순서·생성 정보와 기존 Actor ID는 보존한다. 이름은 실제 표시 방식에 맞춘다. 새 타입에 맞게 configJson과 표시 역할을 바꾸며 숫자·날짜의 기존 formatJson은 보존한다.

- 날짜·이미지·위치·진행률·집계 역할은 일반 DISPLAY로 전환한다. LIST의 BODY는 유지한다.
- 차트/피벗은 같은 원본의 기본 TABLE 제목을 보충한다. 대시보드는 같은 원본의 기본 TABLE 표시 속성3개를 복사한다. 총5개 표시 행만 추가한다.
- 차트의 단일 Status 그룹·단계별 설정은 KANBAN으로 유지한다. 피벗의 행/열 기준은 기존 ID를 유지한 일반 GROUP 두 단계로 전환한다.
- 대시보드 위젯3개는 원본 행·배치를 백업한 뒤 연결 행만 제거한다. 위젯이 참조하던 View와 원본 Record/Entry는 유지한다. 기존 집계 그래프·대시보드 배치 대신 실제 항목을 표시한다.
- 필터·정렬·그룹별 옵션·즐겨찾기·업무 선후행 관계와 원본 업무 데이터는 변경하지 않는다.

DB enum의 11개 값과 스키마·RLS·권한·마이그레이션 이력은 유지한다. 현재 저장된 View가 세 타입만 갖도록 바꾸는 작업이며, 미래 생성 가능한 타입을 DB에서 세 개로 제한하는 enum 변경은 포함하지 않는다.

## 실행과 검증

저장소 루트에서 Node24와 설치된 BE 개발 의존성을 사용한다. 기본 mode는 읽기 전용 plan이다. BE/.env와 선택적 .env.local은 메모리로만 읽는다.

```sh
node BE/prisma/convert-existing-view-types.mjs plan
node BE/prisma/convert-existing-view-types.mjs rehearse
node BE/prisma/convert-existing-view-types.mjs apply
node BE/prisma/convert-existing-view-types.mjs verify
```

- plan: 실제 DB는 READ ONLY다. 설정 사본만 전환하여 실제 공개 Query Port·loader·reader로 24개 본문을 실행한다.
- rehearse: 잠금·백업·전체 쓰기·모든 본문 실행·보존 검사를 실제 transaction에서 수행한다. 생성한 복구 SQL도 같은 transaction 안에서 검증하고 마지막에 전체 rollback한다. transaction 밖에서 원래 digest와 같은지 다시 확인한다.
- apply: Workspace별 advisory lock과 변경 테이블 잠금, 제한된 Serializable transaction 안에서 적용한다. 24개 READY, 최종 타입 건수, 허용 필드와 다른 전체 행의 digest, ENV 보존을 모두 확인한 뒤 commit한다. 검증 실패는 전체 rollback이다.
- verify: 실제 저장 설정을 읽기 전용으로 실행한다. 이미 전환된 상태에서 apply를 다시 실행하면 쓰기0행이다. Workspace·View 신원·이름/타입이 예상과 다르거나 부분 전환 상태면 덮어쓰지 않고 중단한다.

API 계약·서버 코드는 변경하지 않는다. 도구의 검증용 사용자 맥락은 reader의 시간대·cursor 맥락에만 사용하며 로그인 HTTP 인증 검증을 대체하지 않는다. 실제 Record/Entry 값은 출력하지 않고 상태·건수만 기록한다.

## 백업과 복구

첫 DB 쓰기 전에 Git 제외 경로 `TEMP/view-type-conversion-<시각>-<mode>/`에 원본 행·변경 계획·보호 대상 digest를 `before.json`으로 보관한다. 검증 후 `restore.sql`과 `validated.json`을 추가한다. 디렉터리는700, 파일은600 권한이며 접속 문자열·비밀키·사용자 인증정보를 저장하지 않는다.

복구 SQL은 사후 변경 모델의 전체 digest가 일치할 때만 이번 변경을 되돌린다. 이후 사용자 설정 편집이 있으면 중단한다. 기존 updatedAt까지 복원하고 신규 표시5행 제거·원래 위젯3행 복원 후 사전 digest를 검증한다. 실제 적용 후 복구는 자동 실행하지 않으며, 필요 시 이후 변경 여부를 확인하고 별도로 실행한다.

과거 `seed-view-demo-settings.mjs`와 fixture는 11타입 설정을 기록한 이력이다. 전환 후 이를 재실행하면 View 신원 확인에서 중단되며 새 타입을 과거 타입으로 되돌리지 않는다.

## 실제 적용 결과

2026-11-01 영업 Workspace에 적용했다.

- DB 확인: TABLE18 / KANBAN2 / LIST4, 총24개. 보류8타입의 저장 행은0개다.
- 변경: 기존 설정21행 갱신(View8/표시11/그룹2), 제목·목록 표시5행 추가, 대시보드 위젯3행 해제. 총118개 표시 설정이 남는다.
- 보존: 기존24개 View ID·원본 소속·기본 선택 순서, Record54개·Entry56개와 실제 값, 필터·정렬·단계 설정·업무 관계10개. 보호 테이블과 변경 모델의 허용 범위 밖 행은 적용 transaction의 digest가 같다.
- plan에서 24개 READY, 실제 쓰기·복구 SQL의 transaction 검증 및 전체 rollback 후 digest 원복, 실제 apply 후 읽기 전용 verify의 24개 READY를 확인했다. apply 재실행은 갱신·추가·제거0행이다.
- 실행 중 Backend와 같은 compiled 코드의 실제 멤버십 확인·본문 use case 24개와 필터/정렬/설정 메뉴72회도 읽기 전용으로 통과했다. 브라우저 로그인 HTTP 검증과는 구분한다.
- Prisma validate, 도구 문법 검사와 diff 검사를 통과했다. 기존 SetNull 경고4개는 유지된다. ENV 파일 해시와 로컬 Backend·User/Admin Web 정상 응답을 확인했다.
- 실제 적용 백업: `TEMP/view-type-conversion-2026-11-01T12-01-07.676Z-apply/`. `before.json`, `restore.sql`, `validated.json` 및 적용 후 검증 기록을 보관한다. 커밋 대상이 아니다.
