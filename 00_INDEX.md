# 영업 관리 프로그램 기획 문서 - 인덱스

> 대화 내용을 정리한 기획 문서 모음
> 작성일: 2026-05-21
> **최신 업데이트**:
> - 모바일 네이티브 앱 요구 반영 (iOS + Android, React Native + Expo)
> - Admin 웹 추가 (4 클라이언트 + 단일 백엔드 + 라우트 분리)
> - 도메인별 4계층 구조 명시 (각 도메인 모듈이 자체 domain/application/infrastructure/presentation)
> - **수익화/구독/결제는 현재 로드맵에서 제외** (앱 출시 후 별도 기획)

---

## 문서 구성

### 기획 문서 (temp/)

| # | 문서 | 내용 |
|---|------|------|
| 01 | [서비스 기획서](./01_서비스_기획서.md) | 정체성, 핵심 기능, 로드맵, 데이터 모델, 시나리오 |
| 02 | [기술스택 및 아키텍처](./02_기술스택_및_아키텍처.md) | 기술 선택, 다이어그램, 3 클라이언트 구조 |
| 03 | [개발 전략 및 일정](./03_개발_전략_및_일정.md) | 세로 슬라이스, 4주 일정, AI 협업 룰 |
| 04 | [의사결정 기록](./04_의사결정_기록.md) | 모든 결정 사유와 대안 검토 |
| 05 | [요구사항 원본 대화](./05_요구사항_원본_대화.md) | 두 사람 대화에서 추출한 원본 |

### AI 협업 규칙 (temp/AGENT/)

| 영역 | 파일 |
|------|------|
| **Frontend (User 웹)** | [code-convention](./AGENT/Frontend/code-convention.md), [architecture](./AGENT/Frontend/architecture.md), [comment-rules](./AGENT/Frontend/comment-rules.md) |
| **Backend** | [code-convention](./AGENT/Backend/code-convention.md), [architecture](./AGENT/Backend/architecture.md), [comment-rules](./AGENT/Backend/comment-rules.md) |
| **Mobile** | [code-convention](./AGENT/Mobile/code-convention.md), [architecture](./AGENT/Mobile/architecture.md), [comment-rules](./AGENT/Mobile/comment-rules.md) |
| **Admin 웹** | [code-convention](./AGENT/Admin/code-convention.md), [architecture](./AGENT/Admin/architecture.md), [comment-rules](./AGENT/Admin/comment-rules.md) |

---

## 빠른 요약

### 서비스
- **타겟**: 영업직 개인 (B2C)
- **핵심 가치**: 노트북-모바일 동기화 + 명함 디지털화 + 개인 영업 데이터 관리

### 기술 스택 (4 클라이언트 + 단일 백엔드)

**User 웹 (영업사원, 노트북/PC)**
- React + Vite + TypeScript
- TanStack Query + React Hook Form + Zod
- Tailwind CSS + shadcn/ui
- Vercel 배포 (app.yourdomain.com)

**모바일 (영업사원, iOS + Android)**
- React Native + Expo (Managed Workflow)
- Expo Router + TanStack Query + React Hook Form + Zod
- NativeWind (Tailwind for RN)
- expo-camera, expo-sqlite, expo-secure-store
- EAS Build → App Store + Play Store

**Admin 웹 (관리자, PC 전용)**
- React + Vite + TypeScript (User 웹 동일 기반)
- TanStack Table (데이터 테이블)
- Recharts (차트)
- 별도 레포 (sales-admin)
- Vercel 배포 (admin.yourdomain.com)

**백엔드 (User + Admin 통합)**
- NestJS + TypeScript
- **Modular Monolith + DDD + Clean Architecture**
- **각 도메인 모듈이 자체 4계층** (domain/application/infrastructure/presentation)
- Prisma + PostgreSQL
- **User 라우트 `/api/*`, Admin 라우트 `/admin/api/*` (AdminGuard)**
- **User 테이블 role 컬럼 (USER/ADMIN)**
- Supabase Auth + Nest JWT 검증 하이브리드
- Railway (1개월) → VM Lightsail Seoul (이후)

**공통 인프라**
- Supabase Cloud (DB/Storage/Auth, Seoul)
- Naver CLOVA OCR (명함)
- Sentry, UptimeRobot
- GitHub Actions

### 일정
- **4주 안에 Phase 3까지 출시**
- Week 1: 인프라 + 영업 데이터 코어
- Week 2: 필터링 + 오프라인 동기화
- Week 3: 엑셀/PDF + 회사/메모
- Week 4: 명함 OCR + 안정화 + 베타

### 핵심 원칙
1. 메인은 "영업 관리" — 부가 기능 거절
2. 완성도 60% 기능은 안 만든다 ("고깃집의 김치찌개")
3. 세로 슬라이스 개발 (DB→BE→FE/Mobile→배포→QA)
4. 빠른 출시 + 사용자 피드백 반복
5. 테스트 최소 (인증/엑셀 Import만 예외)
6. 락인 회피 5원칙 (1개월 후 VM 이전 대비)

### 백엔드 아키텍처 핵심
- **Modular Monolith + DDD + Clean Architecture**
- **각 도메인 모듈이 자체 4계층** (domain/application/infrastructure/presentation)
- Domain Layer는 NestJS/Prisma import 금지 (순수)
- Application Service는 반드시 Domain Entity로 작업
- Repository는 인터페이스(Domain) + 구현(Infrastructure) 분리
- 모듈 간 통신은 Application Service만 (Repository 직접 호출 금지)
- **User Controller `/api/*`, Admin Controller `/admin/api/*` + AdminGuard**
- **Admin 전용 메서드는 이름에 명시** (예: `findAllForAdmin`)
- **나중에 분리 시 modules/admin/ 폴더만 떼면 됨**

### 프론트/모바일 아키텍처 핵심
- Feature-Sliced Design (FSD)
- 단방향 의존: app → pages → features → shared
- 서버 상태는 TanStack Query, 클라이언트 상태는 Zustand/useState
- Feature 간 import는 index.ts public API만

### 만들 것 / 안 만들 것
**만들 것**: 영업 데이터 CRUD, 멀티 디바이스 동기화, 엑셀/PDF 입출력, 컬럼/탭 필터, 거래처 리스트, 명함 OCR (모바일 카메라), Off-the-record 메모, 인증

**안 만들 것**: 견적서 자동 생성, 결제 서류 자동 생성, 회의 녹음, 자체 캘린더

**나중에**: 상품 카탈로그 자동 입력, 알림, 데이터 백업

> 수익화/구독/결제 시스템은 앱 출시 + 사용자 검증 완료 후 별도로 기획. 현재 로드맵에서 제외.

---

## 변경 이력

### 2026-05-21
- 초기 작성 (대화 기반)
- **모바일 네이티브 앱 추가** (PWA → React Native Expo)
- 4 클라이언트 구조로 변경 (User 웹 + iOS + Android + Admin 웹)
- AGENT/Frontend/Backend/Mobile/Admin 폴더 + 12개 규칙 파일 추가
- 백엔드: Modular Monolith + DDD + Clean Architecture 명시
- **각 도메인 모듈이 자체 4계층** 구조 명시
- **User/Admin 단일 백엔드 + 라우트 분리** 전략 추가
- **수익화/구독/결제 시스템 현재 로드맵에서 제외** (앱 출시 후 별도 기획)

---

## 다음 단계

1. 도메인 구매 (Cloudflare Registrar)
2. GitHub 레포 4개 생성 (`sales-frontend`, `sales-backend`, `sales-mobile`, `sales-admin`)
3. Apple Developer Program 가입 ($99/년)
4. Google Play Console 가입 ($25 일회성)
5. Expo 계정 생성
6. Supabase 프로젝트 생성 (Seoul 리전)
7. Railway + Vercel 가입 (Vercel 프로젝트 2개: User 웹, Admin 웹)
8. AGENT 폴더 + TODO 폴더 실제 작업 공간에 복사
9. Day 1 인프라 셋업 시작
