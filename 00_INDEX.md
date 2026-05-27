# 프로젝트 기획 문서 인덱스

> 영업사원 개인용 영업 관리 도구 — 기획 문서 모음
> 작성일: 2026-05-27 (최종 갱신)
> 서비스명: **(미정)** — 회의 후 확정 예정 ([04_의사결정_필요사항.md](04_의사결정_필요사항.md) D-04)

---

## 문서 구성

| # | 문서 | 내용 |
|---|------|------|
| 01 | [서비스 기획서](./01_서비스_기획서.md) | 정체성, 타겟, 가치, **도메인 22개**, 시나리오, 카카오 / 카카오톡 알림 방향성 |
| 02 | [기술스택 및 SW 아키텍처](./02_기술스택_및_아키텍처.md) | 4단계 개발 순서, 기술 선정, Mermaid 다이어그램, **프론트/모바일 확장성 강화 5가지** |
| 03 | [기능 및 UserFlow](./03_기능_및_UserFlow.md) | **F-01~49 전체** (예시 포함) + Flow A~N + ERD 3개 |
| 04 | [의사결정 필요 사항](./04_의사결정_필요사항.md) | 결정 완료 5개 + 미해결 D-04, D-07~22 (결제 5개 신규 포함) |
| 05 | [추가 기능 아이디어](./05_추가_기능_아이디어.md) | **현재 보류** (사용자 지시). AI 회의록은 채택되어 03번으로 이동 |

> **AI 협업 규칙**은 별도: [AGENT/](AGENT/) 폴더

---

## 빠른 요약

### 서비스
- **타겟**: 영업직 개인 (B2C). 1차 = 계측기 기술영업, 확장 = B2B 기술영업 전반
- **핵심 가치**: 현장 즉시 조회 + 오프더레코드 메모 + 명함 디지털화 + 우선순위 가시화 + AI 회의록

### 도메인 (총 22개)
- **영업 관리 핵심 8개**: User / Company / Contact / Deal / DealActivity / Product / Note / **Meeting**
- **결제 / 구독 6개**: Plan / Subscription / Invoice / Payment / PaymentMethod / Refund
- **시스템 / 운영 5개**: AuditLog / Notification / NotificationPreference / FeatureFlag / ImportJob
- **파일 / 부가 3개**: BusinessCardImage / FilterPreset / RefreshToken

### 개발 순서 (4단계)
1. **User 웹 + Admin 웹 + Backend + 결제/구독 인프라 완성**
2. **웹 출시 + 개발자 내부 검증** (결제 작동 시점에 외부 공개)
3. **AI를 통해 웹 React → 모바일 RN 포팅**
4. **iOS + Android 스토어 출시** (Apple 로그인 추가)

> 외부 공개는 **결제 인프라가 작동할 때부터**. 결제 없이 노출하면 신뢰도 추락.

### 기술 스택
- **User 웹 / Admin 웹** (1단계): React + Vite + TS + TanStack Query + Tailwind + shadcn/ui
- **Admin 웹** 추가: TanStack Table + Recharts
- **모바일** (3단계, AI 포팅): React Native + Expo
- **백엔드**: NestJS + Modular Monolith + DDD + Clean Architecture + Prisma
- **DB / Auth / Storage**: Supabase Cloud (Seoul)
- **OCR**: GPT Vision (OpenAI) — CLOVA 대비 저비용
- **인증**: 카카오 로그인만 (Apple은 iOS 출시 시 추가)
- **AI 회의록**: STT (TBD) + AI 요약 (Claude/GPT)

### 결정 완료
- ✅ D-01 모바일: RN Expo + 웹 우선 → AI 포팅
- ✅ D-02 AI 회의록: **채택** (풀버전)
- ✅ D-03 모바일 오프라인 쓰기: **가능** (모든 도메인)
- ✅ D-05 소셜 로그인: **카카오만**, iOS 시 Apple 추가
- ✅ D-06 이메일 인증: **불필요** (카카오가 검증된 이메일 제공)
- ✅ OCR: CLOVA → GPT Vision (비용 사유)

### 결정 대기 (주요)
- **D-04 서비스명**: 회의 후 확정 예정
- D-07~17: 도메인별 세부 정책 (UX, 단가 통화, 휴지통 알림 등)
- D-18~22: **결제 / 구독 세부** (PG사, Plan 등급, 환불, 영수증)

### 보류 (사용자 지시)
- 추가 기능 아이디어 (05번 문서) — 1단계 완성 후 재검토

---

## 변경 이력

### 2026-05-27 (대규모 갱신)
- 기존 9개 문서(00~09) 삭제 → 새 5개 문서로 재구성
- 새 기획(SalesKit 제안서 + 기능 상세 + AI 회의록 아이디어) 기반
- **D-01 결정**: RN + 웹 우선 → AI 포팅
- **OCR**: CLOVA → GPT Vision
- **결제/구독 도메인 6개 추가** (Plan/Subscription/Invoice/Payment/PaymentMethod/Refund)
- **AI 회의록 채택** (F-46~F-49) + Meeting 도메인 추가
- **개발 순서 4단계 명확화**: 외부 공개는 결제 작동 시점부터
- **인증 단순화**: 카카오 로그인만 (이메일 인증 / 비밀번호 재설정 제거)
- **D-03 결정**: 모바일 오프라인 쓰기 가능 (모든 도메인)
- 프론트/모바일 확장성 강화 5가지 명시 (백엔드-프론트 도메인 매핑, Atomic Design, Key Factory, OpenAPI 자동 생성, 비즈니스 로직 훅 격리)
- 각 기능에 예시 추가 (사용자 이해 도움)
- AGENT 폴더는 그대로 유지
