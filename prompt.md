# 저장소 작업 프롬프트

아래 경로는 현재 저장소 루트 기준이다. 특정 개발자의 절대 경로를 전제로 하지 않는다.

## 문서·구조 학습

```text
먼저 git 변경 상태와 AGENTS.md를 확인해.
AGENT의 현재 결정·기획·UX·Software 문서, BE와 FE의 문서 및 관련 실행 코드를 대조해.
현재 방향은 folk 기능과 UX 벤치마킹이다.
AGENT/PM_AGENT/DECISIONS/036_folk_benchmark_transition.md와
AGENT/UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md를 기준으로 해.
과거 Kit·이전 참고 및 개발 보류 문서는 역사 자료로 구분해.
현재 구현, 목표, 미확인 외부 동작, DB 설계 제안을 섞지 마.
사용자가 제외한 폴더는 링크로도 읽거나 수정하지 마.
학습 요청만으로 실행 코드나 DB를 변경하지 마.
```

## folk 화면 조사·구현

```text
Nicelydone MCP 도구가 사용 가능한지 확인하고 folk 화면·flow·component를 조사해.
출처·캡처 날짜·계정 조건을 남기고 공식 문서 및 실제 계정과 대조해.
연결되지 않았거나 관찰하지 않은 상태를 확인 완료로 표시하지 마.
mock 화면 검토와 같은 흐름의 API·DB·권한 계약을 함께 준비해.
기존 Object/List/View 구조는 전환 영향과 데이터 보존 요구를 확인한 후 제거해.
```

## 로컬 서버

```text
현재 환경과 BE/FE 실행 문서를 확인해 요청한 서버만 구동해.
환경 파일의 비밀값을 출력하거나 임의 변경하지 마.
서버 실행 요청을 DB migration·seed·초기화 요청으로 확대하지 마.
```

## DB 변경

```text
지정한 환경과 대상 DB, migration 내용, 기존 데이터 보존·복구 영향을 확인해.
사용자가 요청한 범위의 migration만 적용하고 결과를 검증해.
문서 전환이나 테이블 제거 계획만으로 원격 DB를 초기화하지 마.
```
