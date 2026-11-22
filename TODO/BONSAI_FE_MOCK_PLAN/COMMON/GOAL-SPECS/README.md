# G Goal 상세 명세

85개 명세 중 [G00 조사](../../RESULTS/G00_RESULT.md), G01 기반 및 G02~G27의 관찰 범위 목 구현·검토를 수행했다. [G01~G15 재점검](../../RESULTS/G01_G15_RECHECK_RESULT.md)에 동작 결함 수정과 문서 정정을 구분한다. 원본 미수록·시각 차이·환경 대기가 있어 G01~G27 전체 완료를 뜻하지 않는다. [G16 결과](../../RESULTS/G16_RESULT.md)는 문서 기본값·로고 공유와 최소 문서 복사 검증이며 실제 문서 작성 연결은 대기다. [G17 결과](../../RESULTS/G17_RESULT.md)는 관찰 초대/대기 제거의 목 구현·검증이며 역할/예외/시각/환경 대기를 유지한다. [G18 결과](../../RESULTS/G18_RESULT.md)는 초대 수락/제한 접근이며 최소 화면은 G21~G27 공유 업무 원본에 연결했다. 미수록/시각/환경 대기는 유지한다. [G19 결과](../../RESULTS/G19_RESULT.md)는 고객 생성/목록/상세이며 G21 프로젝트 선택과 같은 ID로 연결했다. [G20 결과](../../RESULTS/G20_RESULT.md)는 필드 정의/고객별 값/로컬 이미지 저장이며 원본·시각·환경 대기를 유지한다. [G21 결과](../../RESULTS/G21_RESULT.md)는 같은 고객/프로젝트/초대 ID 연결과 초기 단계 목 정책을 기록했다. [G22 결과](../../RESULTS/G22_RESULT.md)는 동일ID의보드/표·조회상태/금액과미수록행액션을분리했다. [G23 결과](../../RESULTS/G23_RESULT.md)는 단계/태그의 목 구현과 lifecycle 원본 대기를 구분한다. [G24 결과](../../RESULTS/G24_RESULT.md)는 상세/설정과 G25~G27 작업·하위·댓글 연결을 기록했다. [G25 결과](../../RESULTS/G25_RESULT.md)는 전체/프로젝트/개요/협업자 작업을 연결했다. [G26 결과](../../RESULTS/G26_RESULT.md)는 독립 하위저장/완료/배정을 검증했다. [G27 결과](../../RESULTS/G27_RESULT.md)는 댓글·자동 활동과 G18~G27 연결을 현재 전체 검사로 확인했다. G28~G84의 57개 G는 미착수다. R01/R02/R03/R05/R06/R20은 소비 범위 분석을 수행했고 전체 완료는 대기, R04·R07~R19·R21~R22의 16개 R은 미착수다. [실행 순서](../GOAL-WORK-ORDER.md)와 [시작 체크](../START-CHECKLIST.md)를 먼저 확인한다. 계약 생성 한 플로우는 G40 1~12단계와 G41 13~19단계로 분리했다.

| Goal | 영역 | 원본 범위 | 추가 분석 |
| --- | --- | --- | --- |
| [G00 근거·버전·범위 대응표](<G00.md>) | 공통 기반 | 공통/통합 | 명세 참조 |
| [G01 독립 mock·공통 컴포넌트](<G01.md>) | 공통 기반 | 공통/통합 | 명세 참조 |
| [G02 랜딩·공통 메뉴](<G02.md>) | 공개 웹 | 1개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G03 고객군·업종·CRM 소개](<G03.md>) | 공개 웹 | 3개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G04 가격·후기](<G04.md>) | 공개 웹 | 2개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G05 블로그·검색·상세](<G05.md>) | 공개 웹 | 3개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G06 공개 템플릿·상세·파일 형식](<G06.md>) | 공개 웹 | 3개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G07 공개 청구서 생성기](<G07.md>) | 공개 웹 | 1개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G08 도움말·기사·문의](<G08.md>) | 공개 웹 | 3개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G09 제휴·채용·정책 안내](<G09.md>) | 공개 웹 | 4개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G10 회원가입](<G10.md>) | 인증·초대 | 1개 플로우 범위 | [R02](<../RESEARCH-GOALS/R02.md>) |
| [G11 로그인·로그아웃](<G11.md>) | 인증·초대 | 2개 플로우 범위 | [R02](<../RESEARCH-GOALS/R02.md>) |
| [G12 비밀번호 재설정](<G12.md>) | 인증·초대 | 1개 플로우 범위 | [R02](<../RESEARCH-GOALS/R02.md>) |
| [G13 사업 설정 온보딩](<G13.md>) | 인증·초대 | 1개 플로우 범위 | [R02](<../RESEARCH-GOALS/R02.md>) |
| [G14 앱 셸·사이드바·404](<G14.md>) | 공통 기반 | 2개 플로우 범위 | 명세 참조 |
| [G15 회사 정보·로고·공개 프로필](<G15.md>) | 내부 업무 | 3개 플로우 범위 | 명세 참조 |
| [G16 문서 브랜드 기본값](<G16.md>) | 내부 업무 | 1개 플로우 범위 | 명세 참조 |
| [G17 멤버 초대·대기 초대 제거](<G17.md>) | 내부 업무 | 2개 플로우 범위 | [R02](<../RESEARCH-GOALS/R02.md>) |
| [G18 초대 수락·협업자 접근](<G18.md>) | 인증·초대 | 1개 플로우 범위 | [R02](<../RESEARCH-GOALS/R02.md>) |
| [G19 목록·신규 고객·상세](<G19.md>) | 내부 업무 | 2개 플로우 범위 | [R03](<../RESEARCH-GOALS/R03.md>) |
| [G20 고객 필드·이미지](<G20.md>) | 내부 업무 | 2개 플로우 범위 | [R03](<../RESEARCH-GOALS/R03.md>), [R20](<../RESEARCH-GOALS/R20.md>) |
| [G21 두 진입점의 프로젝트 생성](<G21.md>) | 내부 업무 | 2개 플로우 범위 | [R03](<../RESEARCH-GOALS/R03.md>) |
| [G22 보드·표 전환](<G22.md>) | 내부 업무 | 2개 플로우 범위 | [R20](<../RESEARCH-GOALS/R20.md>) |
| [G23 단계 이동·태그](<G23.md>) | 내부 업무 | 3개 플로우 범위 | [R05](<../RESEARCH-GOALS/R05.md>), [R20](<../RESEARCH-GOALS/R20.md>) |
| [G24 프로젝트 상세·이름·설정](<G24.md>) | 내부 업무 | 3개 플로우 범위 | [R05](<../RESEARCH-GOALS/R05.md>) |
| [G25 전체·프로젝트 작업 보드와 생성](<G25.md>) | 내부 업무 | 2개 플로우 범위 | [R06](<../RESEARCH-GOALS/R06.md>) |
| [G26 하위 작업·담당자](<G26.md>) | 내부 업무 | 2개 플로우 범위 | [R06](<../RESEARCH-GOALS/R06.md>) |
| [G27 댓글·활동](<G27.md>) | 내부 업무 | 1개 플로우 범위 | [R06](<../RESEARCH-GOALS/R06.md>) |
| [G28 상태 정의·완료 표시](<G28.md>) | 내부 업무 | 2개 플로우 범위 | [R06](<../RESEARCH-GOALS/R06.md>) |
| [G29 보관·삭제](<G29.md>) | 내부 업무 | 2개 플로우 범위 | [R06](<../RESEARCH-GOALS/R06.md>) |
| [G30 작업 템플릿 작성](<G30.md>) | 내부 업무 | 2개 플로우 범위 | [R06](<../RESEARCH-GOALS/R06.md>) |
| [G31 작업 템플릿 적용](<G31.md>) | 내부 업무 | 1개 플로우 범위 | [R06](<../RESEARCH-GOALS/R06.md>) |
| [G32 전역·작업 타이머](<G32.md>) | 내부 업무 | 2개 플로우 범위 | [R07](<../RESEARCH-GOALS/R07.md>) |
| [G33 수동 시간 입력](<G33.md>) | 내부 업무 | 1개 플로우 범위 | [R07](<../RESEARCH-GOALS/R07.md>) |
| [G34 시간 목록·인사이트](<G34.md>) | 내부 업무 | 1개 플로우 범위 | [R07](<../RESEARCH-GOALS/R07.md>) |
| [G35 서비스 라이브러리·템플릿 복사](<G35.md>) | 내부 업무 | 2개 플로우 범위 | [R08](<../RESEARCH-GOALS/R08.md>) |
| [G36 템플릿 선택·초안 생성](<G36.md>) | 내부 업무 | 1개 플로우 범위 | [R09](<../RESEARCH-GOALS/R09.md>) |
| [G37 테마·헤더 스타일](<G37.md>) | 내부 업무 | 2개 플로우 범위 | [R09](<../RESEARCH-GOALS/R09.md>) |
| [G38 만료 설정·발송](<G38.md>) | 내부 업무 | 2개 플로우 범위 | [R09](<../RESEARCH-GOALS/R09.md>) |
| [G39 내부 수락 처리·보관](<G39.md>) | 내부 업무 | 2개 플로우 범위 | [R09](<../RESEARCH-GOALS/R09.md>) |
| [G40 기본 정보·업무 범위](<G40.md>) | 내부 업무 | 1개 플로우 범위 | [R09](<../RESEARCH-GOALS/R09.md>) |
| [G41 지급 조건·청구 설정·초안](<G41.md>) | 내부 업무 | 1개 플로우 범위 | [R09](<../RESEARCH-GOALS/R09.md>) |
| [G42 초안 투어·편집 방식 전환](<G42.md>) | 내부 업무 | 2개 플로우 범위 | [R09](<../RESEARCH-GOALS/R09.md>) |
| [G43 작성자 서명](<G43.md>) | 내부 업무 | 1개 플로우 범위 | [R09](<../RESEARCH-GOALS/R09.md>) |
| [G44 템플릿 탐색·검색·적용](<G44.md>) | 내부 업무 | 4개 플로우 범위 | [R10](<../RESEARCH-GOALS/R10.md>) |
| [G45 폼 목록·질문 편집·순서](<G45.md>) | 내부 업무 | 3개 플로우 범위 | [R10](<../RESEARCH-GOALS/R10.md>) |
| [G46 폼 설정·게시·응답 목록](<G46.md>) | 내부 업무 | 1개 플로우 범위 | [R10](<../RESEARCH-GOALS/R10.md>) |
| [G47 링크·임베드·이메일 공유](<G47.md>) | 내부 업무 | 1개 플로우 범위 | [R10](<../RESEARCH-GOALS/R10.md>) |
| [G48 공개 응답 제출·상세](<G48.md>) | 외부 응답자 | 2개 플로우 범위 | [R10](<../RESEARCH-GOALS/R10.md>) |
| [G49 캘린더 연결 상태](<G49.md>) | 내부 업무 | 1개 플로우 범위 | [R11](<../RESEARCH-GOALS/R11.md>) |
| [G50 예약 기본 정보·가용 시간](<G50.md>) | 내부 업무 | 2개 플로우 범위 | [R11](<../RESEARCH-GOALS/R11.md>) |
| [G51 고급 설정·브랜딩·유형 생성](<G51.md>) | 내부 업무 | 2개 플로우 범위 | [R11](<../RESEARCH-GOALS/R11.md>) |
| [G52 유형 목록·편집·링크 복사](<G52.md>) | 내부 업무 | 3개 플로우 범위 | [R11](<../RESEARCH-GOALS/R11.md>) |
| [G53 공개 날짜·슬롯 조회](<G53.md>) | 공개 예약 | 1개 플로우 범위 | [R11](<../RESEARCH-GOALS/R11.md>) |
| [G54 제안서 수락 후 예약 안내 규칙](<G54.md>) | 내부 업무 | 1개 플로우 범위 | [R11](<../RESEARCH-GOALS/R11.md>), [R12](<../RESEARCH-GOALS/R12.md>) |
| [G55 목록·기본값·표시 설정](<G55.md>) | 내부 업무 | 3개 플로우 범위 | [R13](<../RESEARCH-GOALS/R13.md>) |
| [G56 Stripe 연결·카드 수납 토글](<G56.md>) | 내부 업무 | 2개 플로우 범위 | [R13](<../RESEARCH-GOALS/R13.md>) |
| [G57 단일·반복·구독 초안](<G57.md>) | 내부 업무 | 1개 플로우 범위 | [R14](<../RESEARCH-GOALS/R14.md>) |
| [G58 항목·서비스·헤더 편집](<G58.md>) | 내부 업무 | 2개 플로우 범위 | [R08](<../RESEARCH-GOALS/R08.md>), [R13](<../RESEARCH-GOALS/R13.md>) |
| [G59 미청구 시간 편입](<G59.md>) | 내부 업무 | 1개 플로우 범위 | [R07](<../RESEARCH-GOALS/R07.md>), [R13](<../RESEARCH-GOALS/R13.md>) |
| [G60 고객 미리보기](<G60.md>) | 내부 업무 | 1개 플로우 범위 | [R13](<../RESEARCH-GOALS/R13.md>) |
| [G61 자동 발송 오류·보완 경로](<G61.md>) | 내부 업무 | 1개 플로우 범위 | [R13](<../RESEARCH-GOALS/R13.md>), [R14](<../RESEARCH-GOALS/R14.md>) |
| [G62 입금 차단·정상 경로 보완](<G62.md>) | 내부 업무 | 1개 플로우 범위 | [R13](<../RESEARCH-GOALS/R13.md>), [R14](<../RESEARCH-GOALS/R14.md>) |
| [G63 장부 진입·비용 분류](<G63.md>) | 내부 업무 | 2개 플로우 범위 | [R15](<../RESEARCH-GOALS/R15.md>) |
| [G64 비용 생성·반복·첨부·메모](<G64.md>) | 내부 업무 | 2개 플로우 범위 | [R15](<../RESEARCH-GOALS/R15.md>) |
| [G65 비용 일괄 편집](<G65.md>) | 내부 업무 | 1개 플로우 범위 | [R15](<../RESEARCH-GOALS/R15.md>) |
| [G66 비용 필터](<G66.md>) | 내부 업무 | 1개 플로우 범위 | [R15](<../RESEARCH-GOALS/R15.md>), [R20](<../RESEARCH-GOALS/R20.md>) |
| [G67 수기 수입 생성·삭제](<G67.md>) | 내부 업무 | 2개 플로우 범위 | [R15](<../RESEARCH-GOALS/R15.md>) |
| [G68 비용 내보내기](<G68.md>) | 내부 업무 | 1개 플로우 범위 | [R16](<../RESEARCH-GOALS/R16.md>) |
| [G69 장부 손익·기간 집계](<G69.md>) | 내부 업무 | 1개 플로우 범위 | [R05](<../RESEARCH-GOALS/R05.md>), [R15](<../RESEARCH-GOALS/R15.md>) |
| [G70 은행 연결 소개·취소·미연결 상태](<G70.md>) | 내부 업무 | 1개 플로우 범위 | [R16](<../RESEARCH-GOALS/R16.md>) |
| [G71 전역 검색·최근 조회](<G71.md>) | 내부 업무 | 1개 플로우 범위 | [R20](<../RESEARCH-GOALS/R20.md>) |
| [G72 대시보드 요약·활동](<G72.md>) | 내부 업무 | 1개 플로우 범위 | [R05](<../RESEARCH-GOALS/R05.md>), [R21](<../RESEARCH-GOALS/R21.md>) |
| [G73 관리자 포털 설정](<G73.md>) | 내부 업무 | 1개 플로우 범위 | [R17](<../RESEARCH-GOALS/R17.md>) |
| [G74 설정 탐색·프로필·사진](<G74.md>) | 내부 업무 | 2개 플로우 범위 | [R18](<../RESEARCH-GOALS/R18.md>) |
| [G75 알림 선호](<G75.md>) | 내부 업무 | 1개 플로우 범위 | [R18](<../RESEARCH-GOALS/R18.md>), [R21](<../RESEARCH-GOALS/R21.md>) |
| [G76 계정 삭제 확인·로그인 복귀](<G76.md>) | 내부 업무 | 1개 플로우 범위 | [R18](<../RESEARCH-GOALS/R18.md>) |
| [G77 Client Mode 전환 게이트](<G77.md>) | 내부 업무 | 1개 플로우 범위 | [R18](<../RESEARCH-GOALS/R18.md>) |
| [G78 CSV 가져오기·매핑·오류](<G78.md>) | 내부 업무 | 1개 플로우 범위 | [R16](<../RESEARCH-GOALS/R16.md>) |
| [G79 플랜 가입·청구 표시](<G79.md>) | 내부 업무 | 1개 플로우 범위 | [R18](<../RESEARCH-GOALS/R18.md>) |
| [G80 구독 해지 예약](<G80.md>) | 내부 업무 | 1개 플로우 범위 | [R18](<../RESEARCH-GOALS/R18.md>) |
| [G81 추천 링크](<G81.md>) | 내부 업무 | 1개 플로우 범위 | 명세 참조 |
| [G82 제휴 혜택](<G82.md>) | 내부 업무 | 1개 플로우 범위 | [R01](<../RESEARCH-GOALS/R01.md>) |
| [G83 업무 연결 시나리오](<G83.md>) | 전체 영역 통합 검증 | 공통/통합 | [R01](<../RESEARCH-GOALS/R01.md>), [R02](<../RESEARCH-GOALS/R02.md>), [R03](<../RESEARCH-GOALS/R03.md>), [R04](<../RESEARCH-GOALS/R04.md>), [R05](<../RESEARCH-GOALS/R05.md>), [R06](<../RESEARCH-GOALS/R06.md>), [R07](<../RESEARCH-GOALS/R07.md>), [R08](<../RESEARCH-GOALS/R08.md>), [R09](<../RESEARCH-GOALS/R09.md>), [R10](<../RESEARCH-GOALS/R10.md>), [R11](<../RESEARCH-GOALS/R11.md>), [R12](<../RESEARCH-GOALS/R12.md>), [R13](<../RESEARCH-GOALS/R13.md>), [R14](<../RESEARCH-GOALS/R14.md>), [R15](<../RESEARCH-GOALS/R15.md>), [R16](<../RESEARCH-GOALS/R16.md>), [R17](<../RESEARCH-GOALS/R17.md>), [R18](<../RESEARCH-GOALS/R18.md>), [R19](<../RESEARCH-GOALS/R19.md>), [R20](<../RESEARCH-GOALS/R20.md>), [R21](<../RESEARCH-GOALS/R21.md>), [R22](<../RESEARCH-GOALS/R22.md>) |
| [G84 역할·웹 접근성·회귀·범위 감사](<G84.md>) | 전체 영역 통합 검증 | 공통/통합 | [R01](<../RESEARCH-GOALS/R01.md>), [R02](<../RESEARCH-GOALS/R02.md>), [R03](<../RESEARCH-GOALS/R03.md>), [R04](<../RESEARCH-GOALS/R04.md>), [R05](<../RESEARCH-GOALS/R05.md>), [R06](<../RESEARCH-GOALS/R06.md>), [R07](<../RESEARCH-GOALS/R07.md>), [R08](<../RESEARCH-GOALS/R08.md>), [R09](<../RESEARCH-GOALS/R09.md>), [R10](<../RESEARCH-GOALS/R10.md>), [R11](<../RESEARCH-GOALS/R11.md>), [R12](<../RESEARCH-GOALS/R12.md>), [R13](<../RESEARCH-GOALS/R13.md>), [R14](<../RESEARCH-GOALS/R14.md>), [R15](<../RESEARCH-GOALS/R15.md>), [R16](<../RESEARCH-GOALS/R16.md>), [R17](<../RESEARCH-GOALS/R17.md>), [R18](<../RESEARCH-GOALS/R18.md>), [R19](<../RESEARCH-GOALS/R19.md>), [R20](<../RESEARCH-GOALS/R20.md>), [R21](<../RESEARCH-GOALS/R21.md>), [R22](<../RESEARCH-GOALS/R22.md>) |
