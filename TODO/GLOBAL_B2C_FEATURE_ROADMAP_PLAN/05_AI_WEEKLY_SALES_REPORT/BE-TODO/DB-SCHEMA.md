# DB Schema TODO

상태: Draft

## 모델 후보

- `AiWeeklySalesReport`
- `AiProviderCallLog`
- `AiJob`
- `AiFollowUpSuggestion` 후보
- `AiDataCleanupSuggestion` 후보

## 결정 baseline 반영 후 세부 확인

- 저장형 report version/overwrite 방식
- provider input/output 저장 여부
- 원문 데이터 보관 금지 범위
- 비용 추적 필드
- user/week unique 기준
- follow-up/data cleanup suggestion 저장 여부와 만료 기준
- 사용자가 적용/무시한 제안의 audit 범위

## migration 주의

- AI 결과와 provider log는 민감정보가 될 수 있다.
- 삭제 요청과 보관 기간 정책이 필요하다.
- AI 제안은 추천 근거와 적용 결과를 분리해 저장해야 한다.
