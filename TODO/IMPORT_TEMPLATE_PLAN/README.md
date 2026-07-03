# 데이터 불러오기 양식 1차 구현

## 범위
- ImportTemplate, ImportUserLog, ImportUserLogRow 테이블 추가
- 활성 불러오기 양식 목록 조회 API 추가
- 불러오기 양식 xlsx 다운로드 API 추가
- CSV/XLSX 업로드, 파싱, 미리보기, 임시 job 생성 API 추가
- AI 컬럼 매핑과 규칙 기반 fallback 추가
- 사용자 mapping/row 보정과 검증 API 추가
- 회사/담당자/제품/딜 확정 저장과 성공 로그 저장 API 추가
- 성공한 불러오기 내역 목록/상세 조회 API 추가
- User Web 데이터 불러오기 화면에서 양식 선택/다운로드 연결
- User Web 업로드, 매핑, row 수정/검증, 확정 저장 flow 연결
- User Web 데이터 불러오기 내역 목록/상세 테이블 화면 추가

## 제외
- 확정 전 ImportJob DB 영속화
- 서버 재시작 후 임시 job 이어받기
- 범용 ExportJob
