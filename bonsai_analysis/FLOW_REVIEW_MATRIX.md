# Bonsai 134개 플로우 FE 보완표

검토일: 2026-11-20 KST. [전체 결과·근거·공통 수용 기준](FE_REVIEW.md).

모든 행의 MCP 단계 순서·원본 URL과 분석의 입력·상태·규칙·미확인 사항을 대조했다. 아래 분류는 캡처의 관찰 범위이며 구현 완료 등급이 아니다. 수용 기준은 아직 실행하지 않은 FE 검증 후보다. 세부 관찰·출처·기존 질문은 연결된 ANALYSIS.md의 4~8절을 함께 읽는다.

| 분류 | 의미 |
| --- | --- |
| 결과 | 주요 입력·변경의 결과 표시가 있다. 실제 저장·전달·결제 검증은 별도다. |
| 부분 | 오류·폼·선택·안내에서 끝나거나 목표 완료에 중요한 중간 단계가 빠졌다. |
| 조회 | 탐색·목록·설정 조회가 주된 범위다. 메뉴의 실행 결과까지 확인한 것은 아니다. |
| 공개 | 마케팅·콘텐츠·도움말 페이지다. 삽입 목업은 앱 실행 증거가 아니다. |

공통 적용: [FE 상태·라우팅 기준](FE_REVIEW.md#fe-acceptance), [화면 간 공유 상태](FE_REVIEW.md#cross-flow), [현재 제품에서 추가 조사할 기능](FE_REVIEW.md#product-gaps). 오래된 캡처와 현행 도움말 사이에서 UI·정책이 다른 항목은 자동 병합하지 않는다.

<a id="flow-b340c3e3-ad5f-401c-839d-60e02a8c7ce2"></a>
## 001. 404

[분석](<flows/404/ANALYSIS.md>) · `b340c3e3-ad5f-401c-839d-60e02a8c7ce2` · 2단계 · **조회**

- 기록 종료: 마지막 캡처는 **흰 배경 Page Not Found**이다. 페이지가 없거나 이동했다는 안내.
- FE 보완·수용 기준 후보: 홈 복귀와 신고 버튼의 목적지를 구분하고, 미인증·삭제 자원·잘못된 URL 시나리오의 복구 경로를 정한다.

<a id="flow-08d7796f-33e4-4742-9a98-04c919916456"></a>
## 002. Accepting an invitation

[분석](<flows/Accepting an invitation/ANALYSIS.md>) · `08d7796f-33e4-4742-9a98-04c919916456` · 13단계 · **부분**

- 기록 종료: 마지막 캡처는 **협업자 프로필 메뉴**이다. 역할별메뉴차이.
- FE 보완·수용 기준 후보: 일반 가입과 초대 전용 가입을 분리한다. 초대 이메일 일치·불일치·만료·재사용과 협업자 제한 화면을 별도 seed로 검증한다.

<a id="flow-a5f7a722-8a0c-4528-966a-903e7e0873fb"></a>
## 003. Adding a new client

[분석](<flows/Adding a new client/ANALYSIS.md>) · `a5f7a722-8a0c-4528-966a-903e7e0873fb` · 7단계 · **결과**

- 기록 종료: 마지막 캡처는 **고객 상세 하단의 빈 업무 영역**이다. 노트·인보이스·완료된 폼이 없는 상태.
- FE 보완·수용 기준 후보: 고객 생성 후 목록·상세·프로젝트 고객 선택에서 같은 ID를 조회한다. 회사명 공란·연락처 중복의 처리는 가정으로 명시한다.

<a id="flow-fcb41661-2520-40ac-842c-b463a7891093"></a>
## 004. Affiliate Program

[분석](<flows/Affiliate Program/ANALYSIS.md>) · `fcb41661-2520-40ac-842c-b463a7891093` · 4단계 · **공개**

- 기록 종료: 마지막 캡처는 **제휴 최종 CTA**이다. 앞의 가입 CTA와 문의 대안을 반복한다.
- FE 보완·수용 기준 후보: 비율 보상과 고정 보상표의 관계는 미정으로 남긴다. 신청·승인·정산을 성공 화면 없이 완료 처리하지 않는다.

<a id="flow-be5bc5f4-c2fa-4ea2-a923-0250d6302fcb"></a>
## 005. Blog

[분석](<flows/Blog/ANALYSIS.md>) · `be5bc5f4-c2fa-4ea2-a923-0250d6302fcb` · 4단계 · **공개**

- 기록 종료: 마지막 캡처는 **글 카드 저자와 다음 행**이다. 첫 세 카드에 같은 저자 사진·이름 표시, 요약 길이 차이.
- FE 보완·수용 기준 후보: 카테고리·검색·페이지 상태를 연결하고 뒤로가기 복원 및 무결과를 추가한다. 강조 변경만으로 데이터 변경을 판정하지 않는다.

<a id="flow-7b469aed-f69f-4f73-af50-9b1adb7aa052"></a>
## 006. Blog/Blog detail

[분석](<flows/Blog/Blog detail/ANALYSIS.md>) · `7b469aed-f69f-4f73-af50-9b1adb7aa052` · 4단계 · **공개**

- 기록 종료: 마지막 캡처는 **기사 끝·CTA·푸터**이다. SoftwareWorld Task Management 평가 배지와 반복 가입 CTA.
- FE 보완·수용 기준 후보: 목차 앵커와 읽는 위치 표시를 분리해 구현 기준을 정한다. 미수록 중간 본문·추천 글 목적지·목록 복귀 위치를 보완한다.

<a id="flow-d9c648a4-1d8f-47a7-b53e-ea08055e1e7e"></a>
## 007. Blog/Searching blog

[분석](<flows/Blog/Searching blog/ANALYSIS.md>) · `d9c648a4-1d8f-47a7-b53e-ea08055e1e7e` · 3단계 · **공개**

- 기록 종료: 마지막 캡처는 **marketing 검색 결과**이다. 결과 카드1개, 페이지1/1. 요약의2018과 현재 캡처시점은 별개.
- FE 보완·수용 기준 후보: 선택 분류를 유지한 검색과 초기화·무결과·요청 순서 역전 시나리오를 작성한다. debounce와 검색 필드는 가정이다.

<a id="flow-3a74090f-e360-4fb9-9b79-c1ca197708ba"></a>
## 008. Bookkeeping/Adding a bookkeeping category

[분석](<flows/Bookkeeping/Adding a bookkeeping category/ANALYSIS.md>) · `3a74090f-e360-4fb9-9b79-c1ca197708ba` · 6단계 · **결과**

- 기록 종료: 마지막 캡처는 **생성된 사용자 분류 행**이다. 사용자 분류에 편집·삭제 작업이 보이며 생성 토스트가 남아 있다.
- FE 보완·수용 기준 후보: 분류 생성 후 목록과 비용 편집 선택지에 반영한다. 기본 잠금 분류와 사용자 분류를 구분하고 사용 중 삭제 규칙은 별도 확인한다.

<a id="flow-9fcdb469-f302-4610-b0b9-a5af091b5b26"></a>
## 009. Bookkeeping/Adding a recurring expense/Adding an image and note

[분석](<flows/Bookkeeping/Adding a recurring expense/Adding an image and note/ANALYSIS.md>) · `9fcdb469-f302-4610-b0b9-a5af091b5b26` · 5단계 · **부분**

- 기록 종료: 마지막 캡처는 **이미지·메모를 포함한 비용 폼**이다. 첨부와 메모가 채워졌고 비용 모달은 아직 열려 있다.
- FE 보완·수용 기준 후보: 파일 미리보기와 비용 생성 성공을 분리한다. 첨부 제거·메모 유지·모달 취소·업로드 실패의 임시 상태를 정한다.

<a id="flow-f01f87a5-8396-4774-8387-e11c5e0afe03"></a>
## 010. Bookkeeping/Adding a recurring expense

[분석](<flows/Bookkeeping/Adding a recurring expense/ANALYSIS.md>) · `f01f87a5-8396-4774-8387-e11c5e0afe03` · 11단계 · **결과**

- 기록 종료: 마지막 캡처는 **반복 비용 생성 결과**이다. You created a new unbilled expense. 알림.
- FE 보완·수용 기준 후보: 양수 반복 간격 검증과 최초 비용 목록 반영을 재현한다. 차기 발생·수정·중단 및 입력일과 결과일 차이는 별도 검토한다.

<a id="flow-05c04967-f1be-4b73-b6e5-af6199228187"></a>
## 011. Bookkeeping

[분석](<flows/Bookkeeping/ANALYSIS.md>) · `05c04967-f1be-4b73-b6e5-af6199228187` · 7단계 · **조회**

- 기록 종료: 마지막 캡처는 **비용 카테고리 관리**이다. 기존 분류가 있는 목록. 잠금은 보이지만 수정 제한의 정확한 조건은 미확인.
- FE 보완·수용 기준 후보: Overview·Expenses·Income을 공통 데이터로 연결한다. 목록의 중간 건수 차이를 삭제 효과로 넣지 않고 집계 기간·통화 계약을 정한다.

<a id="flow-2c50f586-bb35-480c-a7bc-fdd3857a6f81"></a>
## 012. Bookkeeping/Bookkeeping overview

[분석](<flows/Bookkeeping/Bookkeeping overview/ANALYSIS.md>) · `2c50f586-bb35-480c-a7bc-fdd3857a6f81` · 6단계 · **조회**

- 기록 종료: 마지막 캡처는 **분류 집계 하단**이다. 값이 없는 그룹도 0%·0금액으로 존재한다.
- FE 보완·수용 기준 후보: 필터와 수입·지출·이익·분류 합계의 계산 예제를 만든다. June 툴팁·평균·99% 합계는 근거 불일치로 남긴다.

<a id="flow-91d17dc8-8701-405e-9133-a41f0f55c37c"></a>
## 013. Bookkeeping/Bulk editing expenses

[분석](<flows/Bookkeeping/Bulk editing expenses/ANALYSIS.md>) · `91d17dc8-8701-405e-9133-a41f0f55c37c` · 7단계 · **결과**

- 기록 종료: 마지막 캡처는 **일괄 분류 수정 성공**이다. 2 expenses updated category successfully 알림.
- FE 보완·수용 기준 후보: 선택한 두 비용만 변경하고 비선택 행을 유지한다. 전체 선택 범위·청구 항목 혼합·실패 시 복구 방식을 가정으로 분리한다.

<a id="flow-c2673683-a5fc-4ed3-8c5c-be153e99765a"></a>
## 014. Bookkeeping/Connect bank account

[분석](<flows/Bookkeeping/Connect bank account/ANALYSIS.md>) · `c2673683-a5fc-4ed3-8c5c-be153e99765a` · 3단계 · **부분**

- 기록 종료: 마지막 캡처는 **Plaid 데이터 공유 안내**이다. 외부 제공자 동의·인증 진입 전 단계.
- FE 보완·수용 기준 후보: Plaid 소개 이후 취소·인증 실패·연결 성공·동기화 결과 화면은 추가 근거가 필요하다. 목 연결과 수집 거래를 분리한다.

<a id="flow-187433ca-53fc-4a69-9f8b-82cd0b59a428"></a>
## 015. Bookkeeping/Deleting an income

[분석](<flows/Bookkeeping/Deleting an income/ANALYSIS.md>) · `187433ca-53fc-4a69-9f8b-82cd0b59a428` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **수입 삭제 결과**이다. 25 금액의 첫 행이 사라졌고 'Your income has been deleted.' 알림이 보인다.
- FE 보완·수용 기준 후보: 삭제 대상 ID만 제거하고 목록·동일 기간 합계를 갱신한다. 확인창·복구·반복 수입 이후 발생분의 영향은 미확인이다.

<a id="flow-a8f62075-1597-47e6-855d-c5fd51194c1c"></a>
## 016. Bookkeeping/Downloading expenses

[분석](<flows/Bookkeeping/Downloading expenses/ANALYSIS.md>) · `a8f62075-1597-47e6-855d-c5fd51194c1c` · 4단계 · **부분**

- 기록 종료: 마지막 캡처는 **비용 파일 준비 완료**이다. Your file is ready to be downloaded.
- FE 보완·수용 기준 후보: 생성 중·준비 완료·다운로드 실행·실패를 구분한다. CSV 열·행 범위·인코딩을 별도 목 계약으로 작성한다.

<a id="flow-bd0a6592-522b-4dcd-94ff-68324e44e3b0"></a>
## 017. Bookkeeping/Filtering expenses

[분석](<flows/Bookkeeping/Filtering expenses/ANALYSIS.md>) · `bd0a6592-522b-4dcd-94ff-68324e44e3b0` · 10단계 · **결과**

- 기록 종료: 마지막 캡처는 **조건 일부 해제 후 결과 복원**이다. 두 행이 다시 표시된다.
- FE 보완·수용 기준 후보: 필터별 칩 제거와 결과 복원을 연결한다. 데이터 0건과 필터 결과 0건을 구분하고 내보내기·일괄 선택 범위를 정한다.

<a id="flow-35234808-9af8-4240-9025-e24a5951eaa9"></a>
## 018. Careers

[분석](<flows/Careers/ANALYSIS.md>) · `35234808-9af8-4240-9025-e24a5951eaa9` · 4단계 · **공개**

- 기록 종료: 마지막 캡처는 **회사 가치 카드**이다. 목표 정렬·빠른 실행·자율적 책임을 소개한다.
- FE 보완·수용 기준 후보: 공고 CTA 도착지와 외부 이동을 명시한다. 공개 소개의 휴가·비자 문구를 앱의 인사 정책으로 채택하지 않는다.

<a id="flow-87c1f8ab-d786-4b2c-9861-d75e5813e639"></a>
## 019. Clients/Adding a client field

[분석](<flows/Clients/Adding a client field/ANALYSIS.md>) · `87c1f8ab-d786-4b2c-9861-d75e5813e639` · 4단계 · **부분**

- 기록 종료: 마지막 캡처는 **고객 필드 추가 완료**이다. 편집 종료 상태. Email 필드가 표에 남는다.
- FE 보완·수용 기준 후보: 필드 정의 추가와 고객별 값 편집을 별도 기능으로 설계한다. 빈 편집 행의 개수와 저장 완료 개수를 구분한다.

<a id="flow-dd29b56e-cc30-4875-8f7b-302ca3909d05"></a>
## 020. Clients/Adding a new project (Clients)

[분석](<flows/Clients/Adding a new project (Clients)/ANALYSIS.md>) · `dd29b56e-cc30-4875-8f7b-302ca3909d05` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **생성 프로젝트 요약 아래쪽**이다. 신규 프로젝트의 빈 집계 상태. Your Notes에 회사 내부 공개 안내.
- FE 보완·수용 기준 후보: 고객 상세에서 만든 프로젝트가 해당 고객과 연결되도록 한다. 상단 생성과 열 내부 생성의 초기 단계 차이를 결정 기록에 남긴다.

<a id="flow-f8191fa7-f2d9-4060-bd47-891b2d627aaa"></a>
## 021. Clients

[분석](<flows/Clients/ANALYSIS.md>) · `f8191fa7-f2d9-4060-bd47-891b2d627aaa` · 5단계 · **조회**

- 기록 종료: 마지막 캡처는 **고객 태그와 필드 설정**이다. 정의 목록과 사용 개수를 조회.
- FE 보완·수용 기준 후보: 고객·연락처·포털 설정·태그·필드 정의의 소유 범위를 구분한다. 연락처 추가·기본 변경·검색·보관·삭제는 추가 경로가 필요하다.

<a id="flow-0cf1b411-06f2-4fc9-8af4-30148a3e88e2"></a>
## 022. Clients/Enabling portal access

[분석](<flows/Clients/Enabling portal access/ANALYSIS.md>) · `0cf1b411-06f2-4fc9-8af4-30148a3e88e2` · 2단계 · **결과**

- 기록 종료: 마지막 캡처는 **포털 접근 Enabled**이다. 설정 성공 상태. 고객 포털 자체가 아니라 관리 화면의 미리보기다.
- FE 보완·수용 기준 후보: 관리자 포털 활성화 저장과 재진입을 검증한다. 고객의 로그인·문서 접근·고객별 차단은 별도 공개 화면 흐름으로 보완한다.

<a id="flow-44e00e8a-aa9f-41f1-b9bc-682789c80985"></a>
## 023. Clients/Uploading a client image

[분석](<flows/Clients/Uploading a client image/ANALYSIS.md>) · `44e00e8a-aa9f-41f1-b9bc-682789c80985` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **고객 대표 이미지 교체 완료**이다. 업로드 후 성공 표시. 이미지 원본 파일명은 보이지 않는다.
- FE 보완·수용 기준 후보: 이미지 교체 후 동일 고객 카드·상세에 반영한다. 파일 제한·제거·취소·실패는 관찰된 성공 경로와 구분해 정한다.

<a id="flow-5ea077df-b21b-4455-8b53-bbd8901d54ae"></a>
## 024. Contact Us

[분석](<flows/Contact Us/ANALYSIS.md>) · `5ea077df-b21b-4455-8b53-bbd8901d54ae` · 2단계 · **공개**

- 기록 종료: 마지막 캡처는 **지원 FAQ 목록**이다. 답변·펼침 화살표 없이 질문만 표시된다.
- FE 보완·수용 기준 후보: 이메일·채팅·도움말의 이동 목적지를 각각 명시한다. FAQ 답변과 문의 제출 결과는 미수록으로 표시한다.

<a id="flow-0744777e-0613-4157-b1e2-a1ac0854db27"></a>
## 025. Copying referral link

[분석](<flows/Copying referral link/ANALYSIS.md>) · `0744777e-0613-4157-b1e2-a1ac0854db27` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **추천 링크 복사 완료**이다. 클립보드복사성공UI.
- FE 보완·수용 기준 후보: 복사 피드백과 실제 목 URL을 확인하고 추천 카운트는 증가시키지 않는다. 추천 가입·유료 전환·보상은 별도 기능이다.

<a id="flow-6a26536d-43db-4d46-b0a3-22be61b34b36"></a>
## 026. Creating a new contract

[분석](<flows/Creating a new contract/ANALYSIS.md>) · `6a26536d-43db-4d46-b0a3-22be61b34b36` · 19단계 · **부분**

- 기록 종료: 마지막 캡처는 **계약 목록의 생성 결과**이다. 직전 초안 화면과 달리 Sent 날짜가 있다. 목록에서 서명 완료 여부를 단정할 수 없다.
- FE 보완·수용 기준 후보: 4단계 초안 생성과 회사 형태별 입력을 재현한다. 목록의 Sent는 생략된 서명·발송 이후 상태로 분리하고 자동 발송하지 않는다.

<a id="flow-03c89447-e059-4f05-b9f3-7b1430640cb1"></a>
## 027. Creating a new contract/Contract guide tour

[분석](<flows/Creating a new contract/Contract guide tour/ANALYSIS.md>) · `03c89447-e059-4f05-b9f3-7b1430640cb1` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **투어 종료 후 초안**이다. 투어 종료 후 계약은 여전히 초안이다.
- FE 보완·수용 기준 후보: Next·Back·Finish·닫기 상태를 정의한다. 투어 완료 시 문서 Drafted를 유지하고 재노출 저장 범위는 목 가정으로 기록한다.

<a id="flow-3903d09f-3610-46dd-808a-2e1017a411d5"></a>
## 028. Creating a new contract/Converting contract type

[분석](<flows/Creating a new contract/Converting contract type/ANALYSIS.md>) · `3903d09f-3610-46dd-808a-2e1017a411d5` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **Fully Editable 전환 완료**이다. Contract has been successfully updated 토스트. 본문 계약 조건은 남아 있다.
- FE 보완·수용 기준 후보: 전환 확인의 취소·확정을 구분하고 확정 뒤 Fully Editable를 표시한다. 구조화 값 보존·복원은 실제 동작으로 단정하지 않는다.

<a id="flow-9c947be2-ae51-481b-953f-f7d65a3a366e"></a>
## 029. Creating a new contract/Signing a contract

[분석](<flows/Creating a new contract/Signing a contract/ANALYSIS.md>) · `9c947be2-ae51-481b-953f-f7d65a3a366e` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **계약 하단 양측 서명란**이다. 작성자 서명만 존재하고 고객 서명은 대기한다.
- FE 보완·수용 기준 후보: 작성자 서명 후 Finalized와 고객 빈 서명란을 표시한다. 고객 발송·열람·서명·철회는 별도 흐름과 상태가 필요하다.

<a id="flow-60d9a6ef-22e9-463e-bcbb-ebd993a06e02"></a>
## 030. Creating a proposal

[분석](<flows/Creating a proposal/ANALYSIS.md>) · `60d9a6ef-22e9-463e-bcbb-ebd993a06e02` · 12단계 · **결과**

- 기록 종료: 마지막 캡처는 **제안서 초안 편집기**이다. 초안 생성 및 저장 표시. Sent/Accepted 날짜 빈칸.
- FE 보완·수용 기준 후보: 템플릿 미리보기·고객 선택·신규 프로젝트·제안 초안 생성의 임시 상태를 나눈다. 취소 시 남는 객체와 템플릿 값 치환을 정한다.

<a id="flow-2ea53e4d-6f67-4621-bb41-c56eeb054811"></a>
## 031. Creating a proposal/Archiving a proposal

[분석](<flows/Creating a proposal/Archiving a proposal/ANALYSIS.md>) · `2ea53e4d-6f67-4621-bb41-c56eeb054811` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **보관 후 기본 목록 빈 상태**이다. 필터 기본 목록에서 문서가 안 보임.
- FE 보완·수용 기준 후보: 수락 상태와 보관 여부를 분리하고 기본 목록에서 보관 문서를 숨긴다. 복원 UI와 공유 링크 영향은 추가 근거가 필요하다.

<a id="flow-5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0"></a>
## 032. Creating a proposal/Changing theme

[분석](<flows/Creating a proposal/Changing theme/ANALYSIS.md>) · `5e7c61e1-cd88-4e72-a2c1-bab5ef9bddf0` · 6단계 · **결과**

- 기록 종료: 마지막 캡처는 **Cover 적용 후 스타일 패널**이다. 스타일 편집 종료 상태.
- FE 보완·수용 기준 후보: 테마별 배치 변경 시 금액·문서 상태를 유지한다. 직접 지정한 색·이미지 보존, 미저장 취소·인쇄 차이를 별도 정한다.

<a id="flow-b4fff91d-639e-4818-9ec8-4dc1bfc3a18a"></a>
## 033. Creating a proposal/Creating a new automation

[분석](<flows/Creating a proposal/Creating a new automation/ANALYSIS.md>) · `b4fff91d-639e-4818-9ec8-4dc1bfc3a18a` · 6단계 · **부분**

- 기록 종료: 마지막 캡처는 **개인 제안서 템플릿 목록**이다. 개인템플릿한개존재.
- FE 보완·수용 기준 후보: 규칙 생성과 실행을 구분한다. Event Type 미선택 이후 누락된 설정, 이미 수락한 문서 소급 실행·중복 규칙을 미정으로 둔다.

<a id="flow-b8c9b3db-6f13-454c-8abf-52859fd329e5"></a>
## 034. Creating a proposal/Editing header style

[분석](<flows/Creating a proposal/Editing header style/ANALYSIS.md>) · `b8c9b3db-6f13-454c-8abf-52859fd329e5` · 7단계 · **결과**

- 기록 종료: 마지막 캡처는 **제목·텍스트색 저장 표시**이다. 스타일변경완료표시.
- FE 보완·수용 기준 후보: 헤더 제목색과 텍스트색의 적용 대상을 나눈다. 잘못된 색 입력·취소·테마 변경 우선순위·고객 미리보기 일치를 검증한다.

<a id="flow-7f481864-a5f0-4786-a800-334c1637b819"></a>
## 035. Creating a proposal/Marking as accepted

[분석](<flows/Creating a proposal/Marking as accepted/ANALYSIS.md>) · `7f481864-a5f0-4786-a800-334c1637b819` · 6단계 · **결과**

- 기록 종료: 마지막 캡처는 **수락된 제안서 상세**이다. 수락된문서읽기상태.
- FE 보완·수용 기준 후보: 관리자 수동 수락과 고객 수락을 분리한다. 선택 패키지·편집 제한은 표시하되 결제나 자동 인보이스 생성 성공을 합치지 않는다.

<a id="flow-21548d39-a3a9-4f72-883d-250c6a60c774"></a>
## 036. Creating a proposal/Sending a proposal

[분석](<flows/Creating a proposal/Sending a proposal/ANALYSIS.md>) · `21548d39-a3a9-4f72-883d-250c6a60c774` · 8단계 · **결과**

- 기록 종료: 마지막 캡처는 **Sent 제안서 상세**이다. 발송후읽기상태.
- FE 보완·수용 기준 후보: 7일 만료·발송 미리보기·Sent 표시를 연결한다. 이메일 전달 실패·재발송과 URL 공유는 독립 시나리오로 추가한다.

<a id="flow-b597e800-c771-4e17-8ddb-1167f2a61deb"></a>
## 037. Creating a proposal/Setting proposal expiration date

[분석](<flows/Creating a proposal/Setting proposal expiration date/ANALYSIS.md>) · `b597e800-c771-4e17-8ddb-1167f2a61deb` · 6단계 · **결과**

- 기록 종료: 마지막 캡처는 **만료일 업데이트 성공**이다. 설정성공.
- FE 보완·수용 기준 후보: 만료일 편집·지우기·확정·취소를 정의한다. 문서 수락 만료와 공유 링크 만료의 규칙을 같은 값으로 처리하지 않는다.

<a id="flow-a346e78b-8075-4537-ae03-d377056d237a"></a>
## 038. Dashboard/Adding company details

[분석](<flows/Dashboard/Adding company details/ANALYSIS.md>) · `a346e78b-8075-4537-ae03-d377056d237a` · 8단계 · **결과**

- 기록 종료: 마지막 캡처는 **대시보드 예약 온보딩**이다. 예약 페이지 생성 단계의 안내 화면. 아래 Timeline은 현재 활동 없음.
- FE 보완·수용 기준 후보: Save Address와 바깥 Save를 분리하고 국가 변경만으로 통화를 바꾸지 않는다. 취소 범위와 기존 문서 반영은 가정으로 둔다.

<a id="flow-29e9a0b7-4ba1-4970-9790-08e7d46bc38e"></a>
## 039. Dashboard/Adding company details/Uploading company logo

[분석](<flows/Dashboard/Adding company details/Uploading company logo/ANALYSIS.md>) · `29e9a0b7-4ba1-4970-9790-08e7d46bc38e` · 4단계 · **부분**

- 기록 종료: 마지막 캡처는 **회사 로고 표시**이다. 로고 미리보기 추가. 아직 전체 Save 전이다.
- FE 보완·수용 기준 후보: 로고 선택·로딩·미리보기·전체 회사 저장을 별도 상태로 둔다. 제거·닫기·실패 시 임시 파일 처리와 용량 제한을 보완한다.

<a id="flow-5b74c74e-20d1-4811-8d96-864144e38a65"></a>
## 040. Dashboard/Adding income manually

[분석](<flows/Dashboard/Adding income manually/ANALYSIS.md>) · `5b74c74e-20d1-4811-8d96-864144e38a65` · 11단계 · **결과**

- 기록 종료: 마지막 캡처는 **대시보드 복귀**이다. 수입 목록에서 대시보드로 이동했다.
- FE 보완·수용 기준 후보: 수기 수입을 생성해 목록에 반영하고 외부 지급 성공과 구분한다. 세전·세후 및 인보이스 입금 중복 집계는 별도 규칙이다.

<a id="flow-a15f8066-29c2-457a-beea-e0e83b8d4dde"></a>
## 041. Dashboard

[분석](<flows/Dashboard/ANALYSIS.md>) · `a15f8066-29c2-457a-beea-e0e83b8d4dde` · 8단계 · **조회**

- 기록 종료: 마지막 캡처는 **대시보드 하단 활동**이다. 문서/프로젝트/작업 이벤트가 하나의 목록에 섞인다.
- FE 보완·수용 기준 후보: 공통 저장소에서 작업·활동·문서·시간 요약을 파생한다. 날짜와 통화가 다른 캡처의 합계를 한 시나리오에 섞지 않는다.

<a id="flow-4e44dbea-bf16-4dbf-a350-472b1b419248"></a>
## 042. Dashboard/Connecting to Google Calendar/Adding event details

[분석](<flows/Dashboard/Connecting to Google Calendar/Adding event details/ANALYSIS.md>) · `4e44dbea-bf16-4dbf-a350-472b1b419248` · 5단계 · **부분**

- 기록 종료: 마지막 캡처는 **기본 가용성 로드 완료**이다. 회색 로딩이 사라지고 Available/Unavailable 범례가 표시된다.
- FE 보완·수용 기준 후보: 이벤트 이름·slug·길이·회의 방식·메일 옵션을 유형 초안에 보관한다. 다음 단계 진입을 유형 생성 완료로 처리하지 않는다.

<a id="flow-eb3647ee-e2ea-4435-bdf6-291ebd62f550"></a>
## 043. Dashboard/Connecting to Google Calendar

[분석](<flows/Dashboard/Connecting to Google Calendar/ANALYSIS.md>) · `eb3647ee-e2ea-4435-bdf6-291ebd62f550` · 8단계 · **결과**

- 기록 종료: 마지막 캡처는 **첫 이벤트 유형 설정·연결 성공**이다. Calendar connected successfully 토스트. 예약 후 Meet 링크 생성 안내.
- FE 보완·수용 기준 후보: 외부 캘린더 연결 상태와 이벤트 유형 존재 여부를 나눈다. 동의 취소·콜백 오류·재연결을 목 상태로 정의하고 외부 호출하지 않는다.

<a id="flow-dc6c28b1-c2c2-4118-9358-3578b336031e"></a>
## 044. Dashboard/Connecting to Google Calendar/Editing advanced settings

[분석](<flows/Dashboard/Connecting to Google Calendar/Editing advanced settings/ANALYSIS.md>) · `dc6c28b1-c2c2-4118-9358-3578b336031e` · 5단계 · **부분**

- 기록 종료: 마지막 캡처는 **Branding & Design 초기**이다. 3단계를 벗어나 마지막 디자인 설정에 도달했다.
- FE 보완·수용 기준 후보: 리드타임·예약 가능 기간·전후 버퍼·질문·알림을 서로 다른 값으로 둔다. 최종 유형 저장과 기존 예약 반영은 별도 검증한다.

<a id="flow-b126bdbf-4f4f-455e-b62a-b9413b8fb7e7"></a>
## 045. Dashboard/Connecting to Google Calendar/Editing an event type

[분석](<flows/Dashboard/Connecting to Google Calendar/Editing an event type/ANALYSIS.md>) · `b126bdbf-4f4f-455e-b62a-b9413b8fb7e7` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **유형 수정 성공**이다. Event type updated successfully!
- FE 보완·수용 기준 후보: 유형 편집 후 목록과 재진입 값이 일치하도록 한다. 확인 메일 off를 모든 알림 off로 확장하지 않는다.

<a id="flow-d9ed6982-0264-44ed-bb1a-82ad16b0e89f"></a>
## 046. Dashboard/Connecting to Google Calendar/Editing branding & design

[분석](<flows/Dashboard/Connecting to Google Calendar/Editing branding & design/ANALYSIS.md>) · `d9ed6982-0264-44ed-bb1a-82ad16b0e89f` · 10단계 · **결과**

- 기록 종료: 마지막 캡처는 **생성된 유형 목록**이다. 생성한 유형이 목록에 나타난다.
- FE 보완·수용 기준 후보: 테마·로고 초안과 Finish 성공을 나눈다. 유형 생성 후 목록과 공개 페이지가 같은 설정을 사용하도록 검증한다.

<a id="flow-5da62684-3be7-48ac-923f-4fdf585d7db1"></a>
## 047. Dashboard/Connecting to Google Calendar/Setting up availability

[분석](<flows/Dashboard/Connecting to Google Calendar/Setting up availability/ANALYSIS.md>) · `5da62684-3be7-48ac-923f-4fdf585d7db1` · 8단계 · **부분**

- 기록 종료: 마지막 캡처는 **Advanced Settings 초기값**이다. 가용성 단계에서 고급 설정으로 이동했다.
- FE 보완·수용 기준 후보: 주간 가용 구간·제외 구간·캘린더 선택·시간대를 따로 둔다. 공개 슬롯 산정과 DST·외부 일정 충돌은 미확인 규칙으로 남긴다.

<a id="flow-dfb2447e-8490-4b16-aeff-edd8101fb0ac"></a>
## 048. Dashboard/Connecting to Google Calendar/View booking page

[분석](<flows/Dashboard/Connecting to Google Calendar/View booking page/ANALYSIS.md>) · `dfb2447e-8490-4b16-aeff-edd8101fb0ac` · 4단계 · **부분**

- 기록 종료: 마지막 캡처는 **목요일 날짜 선택**이다. 금요일과 달리 목요일 점심 슬롯이 있다.
- FE 보완·수용 기준 후보: 날짜별 시간 목록 조회를 재현한다. 시간 선택 이후 예약자 입력·충돌·예약 확정·변경·취소는 추가 화면과 근거가 필요하다.

<a id="flow-be21a04b-0006-4c0c-86bd-4a536d9e7c71"></a>
## 049. Dashboard/Create a contact form (template)

[분석](<flows/Dashboard/Create a contact form (template)/ANALYSIS.md>) · `be21a04b-0006-4c0c-86bd-4a536d9e7c71` · 5단계 · **조회**

- 기록 종료: 마지막 캡처는 **폼 템플릿 목록 로드 완료**이다. 회색영역이 실제미리보기로채워진다.
- FE 보완·수용 기준 후보: 빈 폼과 템플릿 선택을 분리한다. 썸네일 로딩·실패를 구현하고 95개를 제품의 고정 한도로 쓰지 않는다.

<a id="flow-71620f3c-7759-4c18-8fa3-164e3d3e2256"></a>
## 050. Dashboard/Create a contact form (template)/Filtering contact templates

[분석](<flows/Dashboard/Create a contact form (template)/Filtering contact templates/ANALYSIS.md>) · `71620f3c-7759-4c18-8fa3-164e3d3e2256` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **Design 템플릿 결과**이다. 10개실제템플릿과BlankForm으로좁혀진다.
- FE 보완·수용 기준 후보: 분류·페이지·카드 수를 연결하고 Blank Form을 검색 결과 개수에서 구분한다. 필터 결합·페이지 초기화는 가정으로 적는다.

<a id="flow-b3dc7ca0-f03d-4a87-b0e2-84c08aa27400"></a>
## 051. Dashboard/Create a contact form (template)/Searching templates

[분석](<flows/Dashboard/Create a contact form (template)/Searching templates/ANALYSIS.md>) · `b3dc7ca0-f03d-4a87-b0e2-84c08aa27400` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **application 검색 결과**이다. 실제검색결과1개가2분류에집계된다.
- FE 보완·수용 기준 후보: 검색 후 분류별 카운트와 한 개 결과를 일관되게 표시한다. Blank Form 유지·검색 해제·응답 역전 처리를 검증한다.

<a id="flow-0888ad18-25b5-43aa-be17-ae21f1859ea0"></a>
## 052. Dashboard/Create a contact form (template)/Using a template

[분석](<flows/Dashboard/Create a contact form (template)/Using a template/ANALYSIS.md>) · `0888ad18-25b5-43aa-be17-ae21f1859ea0` · 5단계 · **부분**

- 기록 종료: 마지막 캡처는 **폼 편집기 상단**이다. Create와 Content 선택. 이름/이메일은 기본 연락처 영역으로 보이나 시스템 필수 여부는 미확인.
- FE 보완·수용 기준 후보: 미리보기와 편집기 생성 상태를 나눈다. 템플릿 필수값 차이를 보존하고 중복 클릭·생성 취소·게시 기본값을 미정으로 둔다.

<a id="flow-ff646f32-f010-478e-a3bd-572ccc501292"></a>
## 053. Dashboard/Hiding sidebar

[분석](<flows/Dashboard/Hiding sidebar/ANALYSIS.md>) · `ff646f32-f010-478e-a3bd-572ccc501292` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **아이콘 사이드바**이다. 텍스트 메뉴·큰 로고가 숨고 본문폭이 늘어난다.
- FE 보완·수용 기준 후보: 사이드바 축소와 확장, 키보드 접근, 아이콘 이름을 정의한다. 화면 재진입 시 접힘 상태 보존은 구현 선택으로 기록한다.

<a id="flow-4b420645-a17a-4219-9699-5f8081649f02"></a>
## 054. Dashboard/Marking a task as complete

[분석](<flows/Dashboard/Marking a task as complete/ANALYSIS.md>) · `4b420645-a17a-4219-9699-5f8081649f02` · 2단계 · **결과**

- 기록 종료: 마지막 캡처는 **작업 완료 표시**이다. 작업행이 삭제되지 않고 완료스타일로 남는다.
- FE 보완·수용 기준 후보: 완료 체크·취소선·남아 있는 행을 재현한다. 동시에 바뀐 시간 합계를 작업 완료의 자동 효과로 구현하지 않는다.

<a id="flow-89d6f212-12fc-4ad4-b11c-0bbd29708101"></a>
## 055. Filtering all templates

[분석](<flows/Filtering all templates/ANALYSIS.md>) · `89d6f212-12fc-4ad4-b11c-0bbd29708101` · 5단계 · **공개**

- 기록 종료: 마지막 캡처는 **Quotes 목록 아래**이다. 9개 카드와 일부 하단 잘림, 각각 미리보기·라벨·제목.
- FE 보완·수용 기준 후보: 유형·업종·검색·페이지 필터를 분리하고 잘못된 카드 라벨을 도메인 타입으로 쓰지 않는다. 빈 썸네일과 무결과를 구분한다.

<a id="flow-4fe6aa73-a216-43cb-87ff-be898ffc869c"></a>
## 056. Filtering all templates/Template detail

[분석](<flows/Filtering all templates/Template detail/ANALYSIS.md>) · `4fe6aa73-a216-43cb-87ff-be898ffc869c` · 5단계 · **공개**

- 기록 종료: 마지막 캡처는 **FAQ·추가 템플릿**이다. 웹사이트 견적 작성·포함 사항·eCommerce 견적 정의; 하단 No items found 일부가 고정바 위에 보인다.
- FE 보완·수용 기준 후보: 상세·목차·CTA를 연결한다. 이메일 Customize와 Get template의 가입 후 이동·입력 보존·앱 템플릿 대응은 추가 조사한다.

<a id="flow-0452bfda-8ddd-4d2f-8314-7370006c6c68"></a>
## 057. Forms/Adding questions to a form

[분석](<flows/Forms/Adding questions to a form/ANALYSIS.md>) · `0452bfda-8ddd-4d2f-8314-7370006c6c68` · 5단계 · **부분**

- 기록 종료: 마지막 캡처는 **날짜 질문 추가**이다. 짧은 텍스트 다음 날짜 순서가 확인된다.
- FE 보완·수용 기준 후보: 질문 ID·타입·제목·필수 설정·순서를 분리한다. 편집 저장과 응답 제출을 나누고 변경 전 답변을 보존할 시나리오를 정한다.

<a id="flow-d265eece-4da9-4fd4-91f3-517dc07cd8d5"></a>
## 058. Forms

[분석](<flows/Forms/ANALYSIS.md>) · `d265eece-4da9-4fd4-91f3-517dc07cd8d5` · 2단계 · **조회**

- 기록 종료: 마지막 캡처는 **폼 목록**이다. 기존 폼 하나와 응답 0건이 표시된다.
- FE 보완·수용 기준 후보: 질문 수와 응답 수를 별도 집계한다. 목록·편집·응답 화면에 같은 폼 ID를 사용하고 기본 연락처 필드의 집계 여부를 명시한다.

<a id="flow-ecd1821a-aa3a-40f6-beff-71e924dfb56f"></a>
## 059. Forms/Form responses

[분석](<flows/Forms/Form responses/ANALYSIS.md>) · `ecd1821a-aa3a-40f6-beff-71e924dfb56f` · 5단계 · **부분**

- 기록 종료: 마지막 캡처는 **응답 2건 목록**이다. 최신 시각 행이 위에 있다. 기존 0건에서 생성 과정 없이 2건으로 바뀌었다.
- FE 보완·수용 기준 후보: 설정 오류·게시 안내·응답 0건·2건을 별도 seed로 둔다. 제출자 표시명과 고객 매칭을 관찰만으로 확정하지 않는다.

<a id="flow-b3f0ee03-c692-4960-8ed0-a8e15c1b4def"></a>
## 060. Forms/Form responses/Giving a response

[분석](<flows/Forms/Form responses/Giving a response/ANALYSIS.md>) · `b3f0ee03-c692-4960-8ed0-a8e15c1b4def` · 9단계 · **결과**

- 기록 종료: 마지막 캡처는 **응답 제출 완료**이다. 응답 폼은 사라지고 성공 화면이 된다.
- FE 보완·수용 기준 후보: 필수 입력·복수 및 단일 선택·숫자 오류·제출 성공을 재현한다. 응답 목록 연결은 가상 ID로 하고 결제 선택을 실제 결제로 처리하지 않는다.

<a id="flow-31b9d879-ab36-4255-a0e5-34cc4266ce9c"></a>
## 061. Forms/Form responses/Response detail

[분석](<flows/Forms/Form responses/Response detail/ANALYSIS.md>) · `31b9d879-ab36-4255-a0e5-34cc4266ce9c` · 4단계 · **조회**

- 기록 종료: 마지막 캡처는 **응답 상세 하단**이다. 비어 있는 날짜도 항목과 '-'가 유지된다. 추가 문의 질문은 보이지 않는다.
- FE 보완·수용 기준 후보: 제출 당시 질문·답변과 현재 폼 구성을 구분한다. 이름 차이·누락 질문을 자동 매칭으로 메우지 않고 인쇄·삭제·이동을 보완한다.

<a id="flow-68ec72c2-b771-428b-98b7-256018628743"></a>
## 062. Forms/Reordering questions

[분석](<flows/Forms/Reordering questions/ANALYSIS.md>) · `68ec72c2-b771-428b-98b7-256018628743` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **질문 순서 변경 결과**이다. 기존 마지막 두 요소가 서로 자리를 바꿨다.
- FE 보완·수용 기준 후보: 순서 변경 시 질문 ID와 기존 답변 연결을 유지한다. 첫·마지막 이동 제한·공개 폼 반영·저장 실패를 별도 정의한다.

<a id="flow-93ea3af8-3cce-49ec-aaa0-b7d4e9676924"></a>
## 063. Forms/Sharing a form

[분석](<flows/Forms/Sharing a form/ANALYSIS.md>) · `93ea3af8-3cce-49ec-aaa0-b7d4e9676924` · 8단계 · **결과**

- 기록 종료: 마지막 캡처는 **폼 이메일 발송 성공**이다. You've successfully sent your form. 로고 추가 과정은 중간 기록에 없다.
- FE 보완·수용 기준 후보: 링크·임베드·이메일을 독립 탭과 결과로 둔다. 이전 복사 토스트를 다음 작업 성공으로 재사용하지 않고 고객·프로젝트 종속을 정의한다.

<a id="flow-2eeced8d-a39f-4cf1-8f38-0a5b8f989c54"></a>
## 064. Freelancers

[분석](<flows/Freelancers/ANALYSIS.md>) · `2eeced8d-a39f-4cf1-8f38-0a5b8f989c54` · 4단계 · **공개**

- 기록 종료: 마지막 캡처는 **관련 글 목록 하단**이다. Go to dashboard 헤더 유지, 일부 카드 저자가 보이지 않는다.
- FE 보완·수용 기준 후보: 흐름 이름과 실제 Small business 페이지를 구분한다. 로그인 헤더 차이·본문 누락·기사 페이지 이동을 보완한다.

<a id="flow-4f8c359f-2e1f-46bd-953b-bd601767a0f1"></a>
## 065. Help Center

[분석](<flows/Help Center/ANALYSIS.md>) · `4f8c359f-2e1f-46bd-953b-bd601767a0f1` · 2단계 · **공개**

- 기록 종료: 마지막 캡처는 **도움말 홈 하단**이다. Bonsai 2024 저작권 표시.
- FE 보완·수용 기준 후보: 도움말 분류·검색·언어 변경·무결과를 분리한다. 오래된 분류와 기사 수를 현재 고정 규칙으로 사용하지 않는다.

<a id="flow-ec15eccf-bebd-4e1f-87d4-dbc1529a8bbf"></a>
## 066. Help Center/Help article detail

[분석](<flows/Help Center/Help article detail/ANALYSIS.md>) · `ec15eccf-bebd-4e1f-87d4-dbc1529a8bbf` · 4단계 · **공개**

- 기록 종료: 마지막 캡처는 **문서 하단 질문·연관 문서·평가**이다. 이메일 보안 링크 접근과 회사에 여러 연락처가 있을 때 각 연락처 접근 가능성을 설명.
- FE 보완·수용 기준 후보: 목차·영상·피드백 동작을 별도 정한다. 문서 안 설정 이미지와 실제 고객 포털 조작 검증을 구분한다.

<a id="flow-7fcadde8-35c9-4b36-9c76-ec2d4432f20e"></a>
## 067. Industries (Consulting)

[분석](<flows/Industries (Consulting)/ANALYSIS.md>) · `7fcadde8-35c9-4b36-9c76-ec2d4432f20e` · 8단계 · **공개**

- 기록 종료: 마지막 캡처는 **재무·시간 기능 카드**이다. Income & Expenses 선차트와 Time Tracked 막대차트, Billed Amount 배지.
- FE 보완·수용 기준 후보: 마케팅 목업과 실행 가능한 앱 화면을 구분한다. 제목·본문 카피 불일치를 기능 연결 규칙으로 사용하지 않는다.

<a id="flow-646bd9c2-add0-414c-8b98-89489f2c43b5"></a>
## 068. Inviting a member

[분석](<flows/Inviting a member/ANALYSIS.md>) · `646bd9c2-add0-414c-8b98-89489f2c43b5` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **Invite sent와 대기 행**이다. 신규초대대기행표시.
- FE 보완·수용 기준 후보: 초대 발송 후 Invite Pending을 표시하고 수락 전 Joined로 바꾸지 않는다. 역할·프로젝트 선택·중복·만료를 별도 시나리오로 둔다.

<a id="flow-a0181c28-2521-46d3-a0e6-3ead4851b2f9"></a>
## 069. Invoice templates

[분석](<flows/Invoice templates/ANALYSIS.md>) · `a0181c28-2521-46d3-a0e6-3ead4851b2f9` · 11단계 · **공개**

- 기록 종료: 마지막 캡처는 **Word 형식 장단점**이다. 쉬운 사용·비용·맞춤 편집과 오류·기능 제한·자동화/분석 부재 비교.
- FE 보완·수용 기준 후보: 파일 다운로드·Google 문서·앱 가입 CTA를 각각 연결한다. 파일 수신·형식·앱 템플릿 연결은 버튼 존재와 구분한다.

<a id="flow-9a40f1e9-2362-4d00-a603-3f48febb5438"></a>
## 070. Invoices/Adding a new invoice/Adding unbilled time

[분석](<flows/Invoices/Adding a new invoice/Adding unbilled time/ANALYSIS.md>) · `9a40f1e9-2362-4d00-a603-3f48febb5438` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **시간 항목과 시간표가 추가된 초안**이다. 초안 작성 완료. 지급완료 아님.
- FE 보완·수용 기준 후보: 시간 선택·초안 항목·표시 정밀도·합계 70.04를 검증한다. 초안에 추가한 시간, Billed, Paid를 독립 상태로 둔다.

<a id="flow-18f62aba-c34e-486a-b2b8-099fcf9ba779"></a>
## 071. Invoices/Adding a new invoice

[분석](<flows/Invoices/Adding a new invoice/ANALYSIS.md>) · `18f62aba-c34e-486a-b2b8-099fcf9ba779` · 8단계 · **결과**

- 기록 종료: 마지막 캡처는 **인보이스 목록과 결제 연결 안내**이다. 한 개 문서가 있는 목록. 행 왼쪽 반복 아이콘과 회색 점.
- FE 보완·수용 기준 후보: 문서 유형·반복 주기·종료일·발행일·만기를 구분한다. 초안 생성 이후 발송·반복 발생·자동 청구는 별도 시나리오가 필요하다.

<a id="flow-be9884fd-760f-4d30-b3e0-92b55ad8274c"></a>
## 072. Invoices/Adding a new invoice/Editing an item

[분석](<flows/Invoices/Adding a new invoice/Editing an item/ANALYSIS.md>) · `be9884fd-760f-4d30-b3e0-92b55ad8274c` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **Flyer Design 항목 적용**이다. 이름 오류 테두리가 사라진 정상 입력 상태.
- FE 보완·수용 기준 후보: 빈 항목명 오류와 서비스 선택 시 항목 복사를 연결한다. 라이브러리 가격 수정과 기존 문서 금액을 독립시킨다.

<a id="flow-8eb71ff6-6686-4e7f-8092-5036ebff452f"></a>
## 073. Invoices/Adding a new invoice/Editing invoice header

[분석](<flows/Invoices/Adding a new invoice/Editing invoice header/ANALYSIS.md>) · `8eb71ff6-6686-4e7f-8092-5036ebff452f` · 2단계 · **부분**

- 기록 종료: 마지막 캡처는 **인보이스 헤더 이미지 적용**이다. 헤더 파일 적용 상태. 업로드 선택창·진행률은 없음.
- FE 보완·수용 기준 후보: 문서 헤더와 로고를 별도로 편집한다. 파일 선택·실패·제거·미저장 닫기와 발송 문서 변경 범위는 추가 근거가 필요하다.

<a id="flow-20115575-4590-4c0c-a009-7062c5f936ab"></a>
## 074. Invoices/Adding a new invoice/Enable auto-sending

[분석](<flows/Invoices/Adding a new invoice/Enable auto-sending/ANALYSIS.md>) · `20115575-4590-4c0c-a009-7062c5f936ab` · 3단계 · **부분**

- 기록 종료: 마지막 캡처는 **미래 발행일 검증 오류**이다. 예약 실패/차단 상태.
- FE 보완·수용 기준 후보: 미래 발행일 오류만 관찰된 경로로 재현한다. 예약 성공·수신자 확인·Scheduled·예약 취소는 별도 보완한다.

<a id="flow-3170e524-0da8-4acd-aaaa-33c3d0217288"></a>
## 075. Invoices/Adding a new invoice/Preview invoice

[분석](<flows/Invoices/Adding a new invoice/Preview invoice/ANALYSIS.md>) · `3170e524-0da8-4acd-aaaa-33c3d0217288` · 3단계 · **부분**

- 기록 종료: 마지막 캡처는 **인보이스 미리보기 하단**이다. 읽기 전용 문서 표현. 입력 제어 없음.
- FE 보완·수용 기준 후보: 문서 미리보기와 실제 고객 결제 경로를 분리한다. 항목 순서 차이를 정리하고 PDF·타임시트·공유·결제 결과를 추가 검증한다.

<a id="flow-085fa1f3-f846-4dac-9bbd-0b65f000a427"></a>
## 076. Invoices/Adding a new invoice/Record payment

[분석](<flows/Invoices/Adding a new invoice/Record payment/ANALYSIS.md>) · `085fa1f3-f846-4dac-9bbd-0b65f000a427` · 3단계 · **부분**

- 기록 종료: 마지막 캡처는 **입금 기록 차단 모달**이다. 검증 차단 상태. 성공 알림·Paid 표시 없음.
- FE 보완·수용 기준 후보: 차단 모달을 입금 성공으로 만들지 않는다. 현재 도움말의 완납·부분납·방법·날짜·통지를 별도 문서 근거 시나리오로 설계한다.

<a id="flow-0ede7d7b-1ed5-487a-9dbd-b63ef818a29e"></a>
## 077. Invoices

[분석](<flows/Invoices/ANALYSIS.md>) · `0ede7d7b-1ed5-487a-9dbd-b63ef818a29e` · 4단계 · **조회**

- 기록 종료: 마지막 캡처는 **인보이스 표현 설정 Studio**이다. 문서 테마와 결제 페이지 레이아웃을 별도 선택. 미리보기는 실제 청구서가 아니다.
- FE 보완·수용 기준 후보: 목록의 Total·Paid·발행일·만기를 구분한다. 새 문서 기본값과 기존 문서에도 적용되는 표시 설정을 나눠 검증한다.

<a id="flow-f4f79868-6066-440d-9432-cec83923c392"></a>
## 078. Invoices/Connecting to Stripe

[분석](<flows/Invoices/Connecting to Stripe/ANALYSIS.md>) · `f4f79868-6066-440d-9432-cec83923c392` · 10단계 · **결과**

- 기록 종료: 마지막 캡처는 **연결된 결제수단 유지**이다. 연결 후 안정상태.
- FE 보완·수용 기준 후보: Bonsai 인증·외부 인증·처리 중·연결 성공을 나눈다. 연결됨과 카드 수납 on을 분리하고 취소·실패·재연결을 추가한다.

<a id="flow-565b66ad-85f3-48ce-a384-fb856c5dd782"></a>
## 079. Invoices/Connecting to Stripe/Turning off card payments

[분석](<flows/Invoices/Connecting to Stripe/Turning off card payments/ANALYSIS.md>) · `565b66ad-85f3-48ce-a384-fb856c5dd782` · 2단계 · **결과**

- 기록 종료: 마지막 캡처는 **기본 카드 결제 비활성화**이다. 설정 성공. 연결해제와다름.
- FE 보완·수용 기준 후보: 카드 수납 off 이후에도 Stripe 연결 상태를 유지한다. 기존 구독 자동 청구 중단으로 확대하지 않고 재활성 분기를 정의한다.

<a id="flow-a0f52cca-9fee-46e5-af2b-369e1db5e602"></a>
## 080. Invoices/Editing default values (Invoices)

[분석](<flows/Invoices/Editing default values (Invoices)/ANALYSIS.md>) · `a0f52cca-9fee-46e5-af2b-369e1db5e602` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **기본값 저장 성공**이다. 저장 성공 표시.
- FE 보완·수용 기준 후보: 저장한 기본 세금·연체료를 새 문서 생성에 반영한다. 기존 문서·반복 회차 영향과 금액 경계값은 별도 확인한다.

<a id="flow-4a05877b-fd77-4532-a407-7c93a2168895"></a>
## 081. Invoices/Updating invoice settings

[분석](<flows/Invoices/Updating invoice settings/ANALYSIS.md>) · `4a05877b-fd77-4532-a407-7c93a2168895` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **인보이스 설정 저장 후 목록**이다. 설정 저장 성공. 기존 캡처와 목록 데이터가 달라 촬영 시점 차이 가능.
- FE 보완·수용 기준 후보: Foundation 유지·팁 on·명시적 Save를 재현한다. 미리보기 변경·저장·재진입을 나누고 팁을 청구 금액에 즉시 더하지 않는다.

<a id="flow-f1a89cc0-4dc8-4576-b912-78231a2a7b1a"></a>
## 082. Landing page

[분석](<flows/Landing page/ANALYSIS.md>) · `f1a89cc0-4dc8-4576-b912-78231a2a7b1a` · 11단계 · **공개**

- 기록 종료: 마지막 캡처는 **푸터 법적 고지**이다. 2023 저작권, 결제·은행 제휴 및 샘플 데이터·법률 서비스 관련 고지가 작게 보인다.
- FE 보완·수용 기준 후보: 스크롤 섹션·메뉴·후기·가입 CTA를 정의한다. 목업·과거 가격·체험·환불 문구를 현재 업무 정책으로 자동 채택하지 않는다.

<a id="flow-a02409b3-6eb0-4bc0-b702-22a42e0990c8"></a>
## 083. Logging in

[분석](<flows/Logging in/ANALYSIS.md>) · `a02409b3-6eb0-4bc0-b702-22a42e0990c8` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **로그인 후 대시보드**이다. 인증 후 조직 데이터 화면.
- FE 보완·수용 기준 후보: 빈 폼·입력·인증 처리·로그인 결과를 재현한다. 소셜 로그인·2FA·오류·만료는 별도 목 경로이며 실제 인증 호출 여부를 명시한다.

<a id="flow-8f9cc02b-1748-4b71-97d8-5c80bb299013"></a>
## 084. Logging in/Resetting password

[분석](<flows/Logging in/Resetting password/ANALYSIS.md>) · `8f9cc02b-1748-4b71-97d8-5c80bb299013` · 10단계 · **결과**

- 기록 종료: 마지막 캡처는 **비밀번호 재설정 성공**이다. 자동 로그인 화면이 아님.
- FE 보완·수용 기준 후보: 메일 요청 성공·링크 검증·비밀번호 오류·로그인 복귀를 나눈다. 만료·재사용·재발송 제한은 별도 검증 질문이다.

<a id="flow-39713c9a-6f82-4d7c-be32-ab38510406bc"></a>
## 085. Logging out

[분석](<flows/Logging out/ANALYSIS.md>) · `39713c9a-6f82-4d7c-be32-ab38510406bc` · 2단계 · **결과**

- 기록 종료: 마지막 캡처는 **로그아웃 성공**이다. 세션 이탈 성공 표시.
- FE 보완·수용 기준 후보: 로그아웃 후 보호 화면 복귀 동작을 정한다. 현재 탭의 성공 토스트와 다른 세션 폐기는 구분한다.

<a id="flow-f714101f-db6b-4bfe-9ed1-74d6b0d6243c"></a>
## 086. Onboarding

[분석](<flows/Onboarding/ANALYSIS.md>) · `f714101f-db6b-4bfe-9ed1-74d6b0d6243c` · 10단계 · **결과**

- 기록 종료: 마지막 캡처는 **사업 설정 시작**이다. 첫 진행 표시만 녹색.
- FE 보완·수용 기준 후보: 랜딩 이메일 전달·비밀번호 길이와 강도·CAPTCHA·설문 진입을 연결한다. 중복 계정·소셜 가입·메일 인증 분기를 보완한다.

<a id="flow-f004afc2-a8c5-4262-b2e4-941331047a84"></a>
## 087. Onboarding/Completing account setup

[분석](<flows/Onboarding/Completing account setup/ANALYSIS.md>) · `f004afc2-a8c5-4262-b2e4-941331047a84` · 16단계 · **부분**

- 기록 종료: 마지막 캡처는 **초기 작업·시간 빈 상태**이다. 시간그래프빈축,흐린작업샘플.
- FE 보완·수용 기준 후보: 업종·국가·통화·사업 형태·초대·목적 선택의 초안을 유지한다. 빠진 3번째 설문과 MYR/USD 차이는 추가 근거 없이 확정하지 않는다.

<a id="flow-dee9aba7-13a6-462f-87f5-0a942a971ab0"></a>
## 088. Perks

[분석](<flows/Perks/ANALYSIS.md>) · `dee9aba7-13a6-462f-87f5-0a942a971ab0` · 4단계 · **공개**

- 기록 종료: 마지막 캡처는 **Bonsai Perks 하단**이다. 스크롤하단.
- FE 보완·수용 기준 후보: 혜택 CTA 목적지와 적용 자격은 미확인으로 둔다. 현재 공식 본문 확인 없이 과거 할인을 유효 상품으로 표시하지 않는다.

<a id="flow-981ffcc3-d6c0-4038-8db3-4ac8753aace4"></a>
## 089. Pricing

[분석](<flows/Pricing/ANALYSIS.md>) · `981ffcc3-d6c0-4038-8db3-4ac8753aace4` · 3단계 · **공개**

- 기록 종료: 마지막 캡처는 **추가 상품 2종**이다. 각 $10/month; 좌석은 협업·시간·고객 관리, Tax는 비용·공제·분기 추정세 소개.
- FE 보완·수용 기준 후보: 월 환산 가격과 실제 연 결제 합계를 구분한다. 최신 플랜과 캡처 플랜을 같은 정책으로 섞지 않고 선택한 기준을 명시한다.

<a id="flow-776f20e2-7498-433f-af8b-f585988e2429"></a>
## 090. Privacy

[분석](<flows/Privacy/ANALYSIS.md>) · `776f20e2-7498-433f-af8b-f585988e2429` · 2단계 · **공개**

- 기록 종료: 마지막 캡처는 **Privacy 하단**이다. 처리 위탁·사업 양도·정보 요청·정책 변경 안내가 보인다.
- FE 보완·수용 기준 후보: 정책 전체와 개정 버전은 별도 확보한다. 공개 문의 안내와 실제 삭제·열람 처리 UX를 구분한다.

<a id="flow-12ca870d-d929-4cc8-ab4c-60436c2eac13"></a>
## 091. Products (CRM)

[분석](<flows/Products (CRM)/ANALYSIS.md>) · `12ca870d-d929-4cc8-ab4c-60436c2eac13` · 10단계 · **공개**

- 기록 종료: 마지막 캡처는 **CRM FAQ 첫 답변 열림**이다. 첫 답변만 열려 있다.
- FE 보완·수용 기준 후보: 제품 소개·FAQ와 실제 CRM 작업을 구분한다. 목업을 Deals 구현 근거로 쓰지 않고 미수록 답변과 CTA 목적지를 보완한다.

<a id="flow-1a0794d4-deb5-4eb3-b391-c7371c60e684"></a>
## 092. Project detail/Adding a task/Adding a comment

[분석](<flows/Project detail/Adding a task/Adding a comment/ANALYSIS.md>) · `1a0794d4-deb5-4eb3-b391-c7371c60e684` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **작업 댓글 추가 결과**이다. 새 댓글 표시와 입력 초기화.
- FE 보완·수용 기준 후보: 댓글 등록 후 본문 표시와 입력 초기화를 검증한다. 자동 활동과 댓글을 구분하고 공개 범위·편집·삭제·실패를 따로 정한다.

<a id="flow-38dcad7d-b2da-4d91-8eb3-2f3b39899b66"></a>
## 093. Project detail/Adding a task/Adding a time entry

[분석](<flows/Project detail/Adding a task/Adding a time entry/ANALYSIS.md>) · `38dcad7d-b2da-4d91-8eb3-2f3b39899b66` · 6단계 · **부분**

- 기록 종료: 마지막 캡처는 **작업에1시간 누적 표시**이다. 한 시간 기록이 있는 작업.
- FE 보완·수용 기준 후보: 시간 기록 생성과 작업 상세를 ID로 연결한다. 같은 제목 두 작업을 분리하고 성공 뒤 No hours added를 저장 실패로 단정하지 않는다.

<a id="flow-b8bd1036-63f8-4e27-b2b7-a76abf4d8f10"></a>
## 094. Project detail/Adding a task/Adding subtasks

[분석](<flows/Project detail/Adding a task/Adding subtasks/ANALYSIS.md>) · `b8bd1036-63f8-4e27-b2b7-a76abf4d8f10` · 10단계 · **결과**

- 기록 종료: 마지막 캡처는 **하위 작업 완료·담당자 표시와 빈 댓글 입력**이다. Send invite는 완료 체크와 JD를 표시하고 Prepare a deck은 미완료다. 댓글은 비어 있으며 기존 자동 이벤트 두 항목이 보인다. 완료·할당 조작은 생략되어 있고 서버 저장은 독립 검증하지 않았다.
- FE 보완·수용 기준 후보: 하위 입력 저장·완료 체크·담당자 표시를 독립 상태로 둔다. 마지막 Send invite 완료/JD를 반영하고 부모 자동 완료는 가정하지 않는다.

<a id="flow-ee93ca39-d45a-4937-8ee6-7193c985b590"></a>
## 095. Project detail/Adding a task

[분석](<flows/Project detail/Adding a task/ANALYSIS.md>) · `ee93ca39-d45a-4937-8ee6-7193c985b590` · 6단계 · **부분**

- 기록 종료: 마지막 캡처는 **작업 담당자 반영**이다. 드롭다운이 닫히고 담당자가 표시된다.
- FE 보완·수용 기준 후보: 작업 초안 생성 시점과 필드별 반영 시점을 정의한다. 전체 작업 보드·프로젝트 작업·개요를 같은 ID로 갱신하고 닫기·빈 제목을 검증한다.

<a id="flow-cb1a0f7a-140a-42c9-a1a1-cae4c5d2fc9e"></a>
## 096. Project detail/Adding a task/Archiving a task

[분석](<flows/Project detail/Adding a task/Archiving a task/ANALYSIS.md>) · `cb1a0f7a-140a-42c9-a1a1-cae4c5d2fc9e` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **작업 보관 성공**이다. 활성 보드에서 대상 제외.
- FE 보완·수용 기준 후보: 보관 상태와 작업 완료 상태를 분리한다. 보관 후 시간·문서 합계·진행 타이머·복원 동작은 별도 시나리오가 필요하다.

<a id="flow-bbcfb9da-b056-42d0-bb2d-113093d50a8e"></a>
## 097. Project detail/Adding a task/Continue tracking time

[분석](<flows/Project detail/Adding a task/Continue tracking time/ANALYSIS.md>) · `bbcfb9da-b056-42d0-bb2d-113093d50a8e` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **추가 기록과 누적 시간 상세**이다. 7초와 1시간 기록 및 총합 01:00:07이 보인다. 배경에는 같은 제목 카드 2개가 있다.
- FE 보완·수용 기준 후보: 실행 시간과 기존 기록 합계를 나눈다. 7초·1시간 두 행을 유지하고 정지·완료·재개·화면 이동 정책을 전역 타이머와 맞춘다.

<a id="flow-7ca1185e-e3a0-460c-825e-68035a603593"></a>
## 098. Project detail/Adding a task/Deleting a task

[분석](<flows/Project detail/Adding a task/Deleting a task/ANALYSIS.md>) · `7ca1185e-e3a0-460c-825e-68035a603593` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **작업 삭제 성공**이다. 대상 카드 제거와 삭제 성공 피드백.
- FE 보완·수용 기준 후보: 영구 삭제 확인·취소·확정에서 대상 ID만 처리한다. 연관 시간·댓글·파일 삭제와 권한 오류는 미확인 정책으로 남긴다.

<a id="flow-eb7720d8-fb1d-405b-8058-3f1c21adf475"></a>
## 099. Project detail/Adding a task/Editing a subtask

[분석](<flows/Project detail/Adding a task/Editing a subtask/ANALYSIS.md>) · `eb7720d8-fb1d-405b-8058-3f1c21adf475` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **완료 항목 담당자 반영**이다. 담당자 결과 표시.
- FE 보완·수용 기준 후보: 완료된 하위 작업에도 담당자 변경을 표시한다. 체크 해제·제목 편집·부모 연동·알림을 독립 동작으로 보완한다.

<a id="flow-9dcc612c-ab47-4cc3-a2bb-1c434c7da582"></a>
## 100. Project detail/Adding a task/Editing status settings

[분석](<flows/Project detail/Adding a task/Editing status settings/ANALYSIS.md>) · `9dcc612c-ab47-4cc3-a2bb-1c434c7da582` · 6단계 · **결과**

- 기록 종료: 마지막 캡처는 **상태 정의 업데이트 성공**이다. 상태 정의 변경 성공 피드백.
- FE 보완·수용 기준 후보: 작업 상태 선택과 상태 정의 편집을 구분한다. 색 변경을 반영하고 새 상태·삭제·순서·공유 범위를 별도 결정한다.

<a id="flow-669a7507-38b3-41aa-89a2-146530c42240"></a>
## 101. Project detail

[분석](<flows/Project detail/ANALYSIS.md>) · `669a7507-38b3-41aa-89a2-146530c42240` · 6단계 · **조회**

- 기록 종료: 마지막 캡처는 **프로젝트 설정 상단**이다. 기한일 없는 설정, 설명 선택항목.
- FE 보완·수용 기준 후보: 개요·작업·시간·팀·설정을 공통 프로젝트 ID로 연결한다. 진행 단계·수명주기·문서 상태를 분리하고 역할별 탭을 정한다.

<a id="flow-436bff56-c6be-434a-97e4-1fa7b2526a91"></a>
## 102. Project detail/Editing project name

[분석](<flows/Project detail/Editing project name/ANALYSIS.md>) · `436bff56-c6be-434a-97e4-1fa7b2526a91` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **프로젝트 이름 변경 성공**이다. 변경 결과와 성공 안내.
- FE 보완·수용 기준 후보: 이름 Save 후 목록·상세는 갱신하되 과거 활동 텍스트를 임의 변경하지 않는다. 취소·빈 이름·충돌은 별도 목 시나리오다.

<a id="flow-bca79d2d-7b8e-4f84-b35d-18adaec2cd06"></a>
## 103. Project detail/Editing project settings

[분석](<flows/Project detail/Editing project settings/ANALYSIS.md>) · `bca79d2d-7b8e-4f84-b35d-18adaec2cd06` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **프로젝트 설정 저장 결과**이다. 프로젝트 업데이트 성공. 저장한 종료일 자체는 현재 뷰에 없음.
- FE 보완·수용 기준 후보: 종료일 선택·지우기·저장·재진입을 정의한다. 저장 토스트만으로 종료일 영속성을 검증했다고 쓰지 않는다.

<a id="flow-ac1750e4-906b-47f6-ad41-18c1861d4f71"></a>
## 104. Project detail/Updating project status

[분석](<flows/Project detail/Updating project status/ANALYSIS.md>) · `ac1750e4-906b-47f6-ad41-18c1861d4f71` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **프로젝트 추가 액션 메뉴**이다. 추가 액션을 열어 본 상태. 실행 결과는 없음.
- FE 보완·수용 기준 후보: 프로젝트 단계 변경이 제안서 발송을 만들지 않게 한다. 후속 New Lead는 별도 스냅샷으로 두고 완료·보관·삭제 메뉴 결과를 보완한다.

<a id="flow-3aa597f9-f613-46dd-bd8c-45686e423865"></a>
## 105. Projects/Adding a tag

[분석](<flows/Projects/Adding a tag/ANALYSIS.md>) · `3aa597f9-f613-46dd-bd8c-45686e423865` · 9단계 · **결과**

- 기록 종료: 마지막 캡처는 **프로젝트 보드 목록**이다. 상태별 카드와 개수. 가로로 더 있는 열은 현재 뷰포트 밖.
- FE 보완·수용 기준 후보: 태그 생성과 프로젝트 연결을 나눈다. 카드·목록 표시를 갱신하고 이름 중복·기존 태그 편집·연결 해제를 보완한다.

<a id="flow-d1b4cb1f-9280-49ad-b60d-b10fc8bf713d"></a>
## 106. Projects

[분석](<flows/Projects/ANALYSIS.md>) · `d1b4cb1f-9280-49ad-b60d-b10fc8bf713d` · 4단계 · **조회**

- 기록 종료: 마지막 캡처는 **보드 우측 단계 조회**이다. 오른쪽 열의 빈 상태.
- FE 보완·수용 기준 후보: 빈 열 유지·열별 개수·보드 가로 스크롤을 재현한다. 필터·검색·열 관리·뷰 재진입 상태는 별도 설계한다.

<a id="flow-ddea1540-3c0b-4e00-8805-12b4adc290c1"></a>
## 107. Projects/Creating a project (Projects)

[분석](<flows/Projects/Creating a project (Projects)/ANALYSIS.md>) · `ddea1540-3c0b-4e00-8805-12b4adc290c1` · 6단계 · **결과**

- 기록 종료: 마지막 캡처는 **프로젝트 생성 성공 보드**이다. 생성 결과를 보여주는 시작 맥락.
- FE 보완·수용 기준 후보: 고객 선택·제목·팀과 생성 위치의 초기 단계를 연결한다. Sample Client 데모 자동 처리를 일반 고객에게 적용하지 않는다.

<a id="flow-c5e982aa-007d-4e20-8c8b-1fe3c276acc8"></a>
## 108. Projects/Reordering projects

[분석](<flows/Projects/Reordering projects/ANALYSIS.md>) · `c5e982aa-007d-4e20-8c8b-1fe3c276acc8` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **다른 진행 단계로 이동 완료**이다. 새 열 배치와 개수 반영.
- FE 보완·수용 기준 후보: 열 이동 후 카드 상태와 양쪽 건수를 함께 변경한다. 실제 계약 서명과 분리하고 동일 열 정렬·실패 복구·키보드 대안을 보완한다.

<a id="flow-c9dfa93e-36ea-436f-bdef-bc876f4897c5"></a>
## 109. Projects/Switching to list view

[분석](<flows/Projects/Switching to list view/ANALYSIS.md>) · `c9dfa93e-36ea-436f-bdef-bc876f4897c5` · 3단계 · **조회**

- 기록 종료: 마지막 캡처는 **프로젝트 목록 행 메뉴**이다. 행 액션 조회 상태.
- FE 보완·수용 기준 후보: 보드와 표가 동일 프로젝트를 사용하도록 한다. Due를 금액으로 표시하고 정렬·행 메뉴·필터 유지 규칙을 정의한다.

<a id="flow-d501af32-ef6e-4ca1-8d3f-cf6e67874a08"></a>
## 110. Reviews

[분석](<flows/Reviews/ANALYSIS.md>) · `d501af32-ef6e-4ca1-8d3f-cf6e67874a08` · 4단계 · **공개**

- 기록 종료: 마지막 캡처는 **후기 그리드 아래**이다. Alexandre Consultant, Brianna Photographer, Karissa Business Owner, Omari Growth Marketer, Jess Writer, Ravneet Brand Consultant; 하단 Leonardo·Peter·Taylor 일부.
- FE 보완·수용 기준 후보: 영상 재생·카드·외부 후기 이동을 보완한다. 과거 평점·사용자 수를 현재 서비스 지표나 CRM 데이터로 사용하지 않는다.

<a id="flow-283afa82-3835-4672-9d26-a607351efa6b"></a>
## 111. Scheduling

[분석](<flows/Scheduling/ANALYSIS.md>) · `283afa82-3835-4672-9d26-a607351efa6b` · 2단계 · **조회**

- 기록 종료: 마지막 캡처는 **예약 목록과 이벤트 유형**이다. 예정된 예약은 없고 유형은 존재한다.
- FE 보완·수용 기준 후보: 예정 예약 0건과 유형 1개를 분리한다. 예약 발생 후 목록·과거·취소·동기화 오류 화면을 추가 설계한다.

<a id="flow-e2d05800-15f1-4b39-969c-290d5feee7fc"></a>
## 112. Scheduling/Copying a booking page

[분석](<flows/Scheduling/Copying a booking page/ANALYSIS.md>) · `e2d05800-15f1-4b39-969c-290d5feee7fc` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **추가 이벤트 요금제 제한**이다. 현재 캡처의 계정에서 복수 이벤트가 제한된 안내.
- FE 보완·수용 기준 후보: URL 복사와 추가 유형 업그레이드 안내를 별도 행동으로 둔다. 중간 클릭이 없으므로 복사 자체를 유료 제한하지 않는다.

<a id="flow-f6466df8-7932-40c1-a10e-f84bfe1070f5"></a>
## 113. Searching Bonsai

[분석](<flows/Searching Bonsai/ANALYSIS.md>) · `f6466df8-7932-40c1-a10e-f84bfe1070f5` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **검색 뒤 열린 Rebranding Project 상세**이다. 검색 모달이 닫히고 프로젝트 상세가 표시된다. 이 화면에서 작업 목록은 비어 있지만 문서와 활동은 존재한다.
- FE 보완·수용 기준 후보: 최근 조회·검색 중·완료·무결과와 객체별 링크를 나눈다. 삭제·권한 변경 이후 최근 목록 정리와 키보드 탐색을 정한다.

<a id="flow-023d6e51-ce87-40a9-a628-cf7b39cd3b14"></a>
## 114. Services/Adding a service to library

[분석](<flows/Services/Adding a service to library/ANALYSIS.md>) · `023d6e51-ce87-40a9-a628-cf7b39cd3b14` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **서비스 추가 성공 알림**이다. 라이브러리추가성공.
- FE 보완·수용 기준 후보: 템플릿 추가 후 실제 라이브러리에서 새 항목을 조회한다. 성공 토스트와 재조회 검증을 나누고 중복 복사·분류 생성은 미정으로 둔다.

<a id="flow-16a15a7f-2535-457e-838b-877a27767618"></a>
## 115. Services

[분석](<flows/Services/ANALYSIS.md>) · `16a15a7f-2535-457e-838b-877a27767618` · 4단계 · **조회**

- 기록 종료: 마지막 캡처는 **서비스 분류 목록**이다. 분류조회.
- FE 보완·수용 기준 후보: 서비스와 분류 목록·단위별 가격을 구분한다. 신규·수정·삭제·검색·정렬과 기존 문서 가격 보존 경로를 보완한다.

<a id="flow-fe127bb6-984a-4b25-927f-4186b6650743"></a>
## 116. Settings

[분석](<flows/Settings/ANALYSIS.md>) · `fe127bb6-984a-4b25-927f-4186b6650743` · 12단계 · **조회**

- 기록 종료: 마지막 캡처는 **Subscription — 기능과 Tax**이다. 플랜별 문서/CRM/자동화/브랜딩/하도급 기능 구분.
- FE 보완·수용 기준 후보: 개인·운영 회사·브랜딩·팀·구독·연동의 저장 범위를 분리한다. 2FA·기본 메시지·연동 실행과 역할별 설정은 추가 설계한다.

<a id="flow-3d51760e-2893-42a1-ada6-a2c44849a54d"></a>
## 117. Settings/Deleting account

[분석](<flows/Settings/Deleting account/ANALYSIS.md>) · `3d51760e-2893-42a1-ada6-a2c44849a54d` · 5단계 · **부분**

- 기록 종료: 마지막 캡처는 **로그인 — 빈 인증 폼**이다. 로그인 입력 전 화면이다. 계정 삭제 완료나 비밀번호 재설정 완료 안내는 없다.
- FE 보완·수용 기준 후보: 비밀번호 확인과 로그인 복귀를 구분한다. 삭제 완료·비활성화·수신자 문서 보존은 현재 도움말과 별도 대조할 정책이다.

<a id="flow-eb5394cb-70d0-4286-be72-3a6a0c240fd2"></a>
## 118. Settings/Disabling public profile

[분석](<flows/Settings/Disabling public profile/ANALYSIS.md>) · `eb5394cb-70d0-4286-be72-3a6a0c240fd2` · 3단계 · **결과**

- 기록 종료: 마지막 캡처는 **공개 프로필 비활성 저장**이다. 저장 성공.
- FE 보완·수용 기준 후보: 저장 후 공개 프로필 off를 재조회하고 익명 URL 접근 화면을 별도로 둔다. 포털 접근까지 함께 끄지 않는다.

<a id="flow-79468a76-f7fd-456e-843e-66c2763976a5"></a>
## 119. Settings/Editing branding settings

[분석](<flows/Settings/Editing branding settings/ANALYSIS.md>) · `79468a76-f7fd-456e-843e-66c2763976a5` · 6단계 · **결과**

- 기록 종료: 마지막 캡처는 **브랜드 저장 완료**이다. Plant 미리보기 유지·저장 성공 표시.
- FE 보완·수용 기준 후보: 테마 미리보기와 저장을 나누고 새 문서 적용 시나리오를 작성한다. 기존 문서 전체 변경과 화이트라벨 허용은 별도 규칙이다.

<a id="flow-ac111df9-05db-467b-be5a-f58bc35913c0"></a>
## 120. Settings/Editing notification settings

[분석](<flows/Settings/Editing notification settings/ANALYSIS.md>) · `ac111df9-05db-467b-be5a-f58bc35913c0` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **알림 변경 후 계정 업데이트 성공**이다. 계정 저장 성공 안내.
- FE 보완·수용 기준 후보: 두 알림 해제 뒤 재진입 값과 나머지 항목 유지를 검증한다. 설정 저장과 이메일 수신·브라우저 권한은 분리한다.

<a id="flow-3dce7a57-e3a1-4fd6-944a-3f547b30def6"></a>
## 121. Settings/Enable client mode

[분석](<flows/Settings/Enable client mode/ANALYSIS.md>) · `3dce7a57-e3a1-4fd6-944a-3f547b30def6` · 2단계 · **부분**

- 기록 종료: 마지막 캡처는 **Business 전용 플랜 선택**이다. 업그레이드 선택 단계, 결제 폼 없음.
- FE 보완·수용 기준 후보: Business 선택 게이트까지만 관찰된 것으로 둔다. 결제 후 모드 활성화와 외주 멤버 기능은 추가 근거가 필요하다.

<a id="flow-ad6f634b-9fff-44de-acdf-4cd1eaf69123"></a>
## 122. Settings/Importing a CSV

[분석](<flows/Settings/Importing a CSV/ANALYSIS.md>) · `ad6f634b-9fff-44de-acdf-4cd1eaf69123` · 11단계 · **부분**

- 기록 종료: 마지막 캡처는 **Billable 행별 검증 실패**이다. 총17개 행번호 오류가 보임. 성공안내 없음.
- FE 보완·수용 기준 후보: 파일·열 매핑·처리 중·행별 오류·재시도를 연결한다. 성공·부분 저장·중복 방지 및 Currency 오류 순서는 별도 목 정책으로 명시한다.

<a id="flow-c615a678-2203-45d5-bcc0-235f6b325516"></a>
## 123. Settings/Removing a user

[분석](<flows/Settings/Removing a user/ANALYSIS.md>) · `c615a678-2203-45d5-bcc0-235f6b325516` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **팀 멤버 제거 완료**이다. 제거 성공.
- FE 보완·수용 기준 후보: 대기 초대의 대상 이메일 행만 제거한다. 가입 완료 멤버 제거·초대 링크 무효화·좌석 과금은 별도 경로로 보완한다.

<a id="flow-7f83211c-f4cf-4bc7-a715-c64a2a27626b"></a>
## 124. Settings/Uploading profile picture

[분석](<flows/Settings/Uploading profile picture/ANALYSIS.md>) · `7f83211c-f4cf-4bc7-a715-c64a2a27626b` · 5단계 · **결과**

- 기록 종료: 마지막 캡처는 **프로필 저장 성공**이다. 저장 성공 UI.
- FE 보완·수용 기준 후보: 사진 선택 미리보기와 Save 성공을 나눈다. 제거·취소·형식/크기 오류와 재진입 표시를 검증한다.

<a id="flow-06d57391-c7a4-4f63-ba8d-078ea3af046f"></a>
## 125. Starting time tracking

[분석](<flows/Starting time tracking/ANALYSIS.md>) · `06d57391-c7a4-4f63-ba8d-078ea3af046f` · 10단계 · **결과**

- 기록 종료: 마지막 캡처는 **완료된 시간 기록 요약**이다. 기존 입력 폼이 기록 요약으로 바뀌었다.
- FE 보완·수용 기준 후보: 실행·일시정지·재개·Done과 팝오버 닫기를 나눈다. 경과 시간은 제어 가능한 시계로 관리하고 페이지 이동 시 중복 타이머를 만들지 않는다.

<a id="flow-89302289-1851-4066-91e4-d61a28f79e15"></a>
## 126. Subscribing to Starter plan

[분석](<flows/Subscribing to Starter plan/ANALYSIS.md>) · `89302289-1851-4066-91e4-d61a28f79e15` · 12단계 · **결과**

- 기록 종료: 마지막 캡처는 **Team Seat와 구독 영수증**이다. 구독 청구기간 영수증1개.
- FE 보완·수용 기준 후보: 플랜 선택·월/연 합계·추가 인증·처리 중·구독 표시를 나눈다. 결제 실패·중복·프로모션·좌석은 외부 호출 없는 목 시나리오로 둔다.

<a id="flow-89fb5b3c-c982-48a3-a713-b70f07d8c544"></a>
## 127. Subscribing to Starter plan/Canceling subscription

[분석](<flows/Subscribing to Starter plan/Canceling subscription/ANALYSIS.md>) · `89fb5b3c-c982-48a3-a713-b70f07d8c544` · 10단계 · **결과**

- 기록 종료: 마지막 캡처는 **청구기간 말 해지 예약**이다. 해지예약상태.
- FE 보완·수용 기준 후보: 취소 의사·유지 제안·사유·기간 말 종료·설문을 구분한다. 설문 미응답이 해지 예약을 되돌리지 않도록 선택 정책을 기록한다.

<a id="flow-d348e200-5e48-4825-a646-69a6741e85d8"></a>
## 128. Tasks/Adding a task (template)

[분석](<flows/Tasks/Adding a task (template)/ANALYSIS.md>) · `d348e200-5e48-4825-a646-69a6741e85d8` · 7단계 · **결과**

- 기록 종료: 마지막 캡처는 **생성 작업에 기한이 표시된 후속 보드**이다. 기한 있는 카드 후속 상태.
- FE 보완·수용 기준 후보: 템플릿 적용으로 새 작업 ID를 만들고 원본 템플릿을 보존한다. 후속 Feb09를 자동 기한으로 추정하지 않고 반복 적용·첨부 복사를 정한다.

<a id="flow-59d5186e-98e3-495f-b8c0-96eb9c943631"></a>
## 129. Tasks

[분석](<flows/Tasks/ANALYSIS.md>) · `59d5186e-98e3-495f-b8c0-96eb9c943631` · 3단계 · **조회**

- 기록 종료: 마지막 캡처는 **작업 템플릿 빈 상태**이다. 관리할 템플릿 목록 대신 초기 안내를 보여준다.
- FE 보완·수용 기준 후보: 전체 작업 보드와 프로젝트 작업이 같은 저장소를 쓰도록 한다. 빈 템플릿 안내는 실제 작업 seed와 분리한다.

<a id="flow-4c98a858-6ef7-4a6a-8e83-e626772a4df0"></a>
## 130. Tasks/Creating a task template

[분석](<flows/Tasks/Creating a task template/ANALYSIS.md>) · `4c98a858-6ef7-4a6a-8e83-e626772a4df0` · 4단계 · **결과**

- 기록 종료: 마지막 캡처는 **빈 템플릿 생성 성공**이다. 이름이 있는 템플릿 상세와 성공 피드백.
- FE 보완·수용 기준 후보: 이름 있는 빈 템플릿 생성과 구성 작업 추가를 분리한다. 중복 이름·취소·권한 범위는 목 선택으로 명시한다.

<a id="flow-91a75fcf-9857-41ff-85c2-c2de0bae87d9"></a>
## 131. Tasks/Editing a template task

[분석](<flows/Tasks/Editing a template task/ANALYSIS.md>) · `91a75fcf-9857-41ff-85c2-c2de0bae87d9` · 8단계 · **결과**

- 기록 종료: Update company guideline 한 행이 템플릿에 표시된다. 실제 프로젝트 적용은 별도다.
- FE 보완·수용 기준 후보: 하위 Save와 Save Task의 임시 상태를 분리한다. 재진입 시 첨부·하위 항목 유지와 적용된 실제 작업의 변경 독립성을 검증한다.

<a id="flow-912b4b75-77bb-43fa-b86f-d85c6117841a"></a>
## 132. Terms & Conditions

[분석](<flows/Terms & Conditions/ANALYSIS.md>) · `912b4b75-77bb-43fa-b86f-d85c6117841a` · 1단계 · **공개**

- 기록 종료: 마지막 캡처는 **Terms & Conditions 상단**이다. 서비스 계약·이용 동의 설명, 두 서비스 유형, 계정 생성 연령 안내가 보인다.
- FE 보완·수용 기준 후보: 약관 상단 한 장을 전체 문서로 취급하지 않는다. 효력일·전체 본문·가입 링크 버전은 별도 확보한다.

<a id="flow-525f8723-dca6-4932-ac6e-d159249090be"></a>
## 133. Time Tracking

[분석](<flows/Time Tracking/ANALYSIS.md>) · `525f8723-dca6-4932-ac6e-d159249090be` · 6단계 · **조회**

- 기록 종료: 마지막 캡처는 **프로젝트별 타임시트 상세**이다. By Project 보고서의 한 프로젝트 상세가 표시된다.
- FE 보완·수용 기준 후보: 원시 초·표시 시간·단가·금액·청구 상태를 나눈다. 보고서 기간 밖 기록과 동일 제목 작업 ID를 구분하고 합계 예제를 검증한다.

<a id="flow-1a82151c-9539-4a12-8a4d-706c8557370b"></a>
## 134. Using invoice generator

[분석](<flows/Using invoice generator/ANALYSIS.md>) · `1a82151c-9539-4a12-8a4d-706c8557370b` · 5단계 · **부분**

- 기록 종료: 마지막 캡처는 **계정 생성 화면으로 전환**이다. 이메일·이름·이전 청구서 정보가 명시적으로 넘어온 표시는 없다.
- FE 보완·수용 기준 후보: 행 추가·단가·세금 합계를 재현한다. 다운로드 뒤 가입 경로와 데이터 보존을 분리하고 PDF 수신 성공은 추가 근거로 확인한다.
