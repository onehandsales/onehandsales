# R20 소비 범위 보완 결과

상태: G20 소비 분석 수행, R20 전체 완료 아님.

## G20 소비 보완 — 고객 필드·이미지

MCP 신규조회2흐름/7단계, 두 ANALYSIS 4·5·8절과 실제 PNG7/7 확인. App bonsai-web `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, 채택 Latest/2146은 G18 앱 조회 재사용. 개별 촬영일/제품 빌드/CSS viewport/DPR 미확인. `/tmp/onehandsales-g18-g27/G20/mcp-sources.json`에 Flow/Screen/이미지 URL 기록, 구현 결과는 [G20](G20_RESULT.md)에 연결한다.

- 필드 flow `87c1f8ab-d786-4b2c-9861-d75e5813e639`: `sc_cc68ecaccb72426b8573fca9ece52fc9` → `sc_175d01279ca24ead910995ea1cc957d3` → `sc_c231351f09ab4afe865acaf6e68add0f` → `sc_3d631d315dcb40969d26412f158df64c`. 관찰: Add New Field가 첫 빈 행을 열고3→4 Fields, Email은 필드 **이름**. Done 뒤 회색 표시 행/Edit/Delete로 바뀐다. 고객 연락처 이메일과 별개다.
- 이미지 flow `44e00e8a-aa9f-41f1-b9bc-682789c80985`: `sc_b1619b6b9fc3405e8ad67fd26f405b62` → `sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e` → `sc_7a2bb697a852495e8fd9be9fe6563b0a`. 관찰: JS 이니셜, Update Image 오버레이/X, 보라색 인물 이미지와 성공 알림. 선택창/업로드/제거 과정 미수록.

| 행동 | 관찰 / 목 처리 | 실패·취소·재진입 |
| --- | --- | --- |
| 필드 추가 | workspace 정의 ID와 고객별 값 분리. 표시 개수는 저장+빈 초안, 저장 개수는 별도 접근성 설명. Done 후 저장 | 이름 공백/100자 초과/정규화 중복 거부는 목 가정. 취소/Escape/이탈은 빈 행 폐기. 실패는 초안 유지 |
| 정의 이름 수정·삭제 | Edit/Delete 진입은 관찰. 동일 정의 ID 유지·삭제 확인 Dialog와 모든 고객의 해당 값 제거는 목 가정 | 삭제된 ID의 늦은 값/이름 저장 거부, 기본 필드도 동일 목 규칙. 실제 문서의 프리필/서버 연쇄 영향은 미확인 |
| 고객별 값 편집 | G20 명세의 별도 값 입력을 inline 입력/Done/Cancel로 구현하는 목 가정. 모든 값은 선택 텍스트, Email 이름이어도 Contact.email과 무관 | 고객/field ID와 revision 검증, 빈 값 허용,1000자 제한 가정. 취소/실패/다른 고객 재진입 격리 |
| 대표 이미지 | hover 및 keyboard focus에 Update Image. 로컬 파일 선택→미리보기 Dialog→Save Image, X→제거 확인은 목 가정 | PNG/JPEG/WebP≤2MiB·실제 디코딩 검증(기존 로고의 목 한도 재사용). 실패 재시도/다른 선택/취소/이탈/지연 보호. 저장 성공 전 목록/상세 원본 유지 |

같은 고객 ID의 목록·상세가 저장된 File/Blob를 표시하며 G15 운영 회사 로고·G73 포털 헤더와 분리한다. Object URL은 표시 컴포넌트 수명에서 해제한다. 저장은 메모리이며 새로고침/새 탭/Reset 초기화, 같은 탭 재로그인 보존, workspace 격리. G19 초대 협업자 제한 유지. 원본 인물 파일 자체는 확보하지 못했으므로 검증용 로컬 이미지를 원본 파일처럼 기록하지 않는다.

R03 연락처/lifecycle, R20 저장 뷰/공유/검색·다른 객체의 필드 타입은 미수행 대기. 기존 공식 문서 기록은 과거 보완 자료이며 이번에 공식 사이트/API/계정을 조회하지 않았다. 서버 영속/미디어 압축/권한/문서 영향은 후속 메모이며 이번 FE 착수 조건이 아니다.
