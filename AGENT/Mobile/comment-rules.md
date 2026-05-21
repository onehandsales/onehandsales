# Mobile Comment Rules

> 주석은 "WHY"만. "WHAT"은 코드와 명명으로 표현.
> 웹 프론트와 동일 원칙, 모바일 특화 케이스 추가.

---

## 1. 핵심 원칙

### 1.1 기본은 주석 없음
- 잘 짠 컴포넌트/훅은 주석 없이 읽힘
- 좋은 이름이 주석을 대체

### 1.2 주석이 필요한 경우 (WHY)
- 플랫폼 차이 (iOS/Android 별 동작)
- 네이티브 라이브러리 특이 동작
- 오프라인 동기화 결정 이유
- 권한 처리 시 UX 결정
- TODO/FIXME/HACK

### 1.3 절대 쓰지 말 것
- ❌ 코드 그대로 번역
- ❌ JSX 구조 설명
- ❌ 변경 이력
- ❌ 주석 처리된 코드

---

## 2. 좋은 주석 예시 (모바일 특화)

### 2.1 플랫폼 차이
```tsx
// iOS는 키보드 위에 떠야 해서 padding 동작 필요, Android는 height
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
```

```tsx
// Android: 하드웨어 백버튼 핸들링 필요 (iOS는 swipe gesture로 처리됨)
useEffect(() => {
  const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
  return () => sub.remove();
}, []);
```

### 2.2 네이티브 권한
```tsx
// 명함 스캔이 핵심 기능이라 권한 거부 시 설정 앱 이동을 강조
// (단순 거부 메시지만 두면 사용자가 무엇을 해야 할지 모름)
if (!permission.granted) {
  return <PermissionDeniedView onOpenSettings={Linking.openSettings} />;
}
```

### 2.3 오프라인 동기화
```tsx
// last-write-wins: 서버 timestamp 기준으로 충돌 해결
// Phase 1에서는 사용자 알림 없이 처리 (베타 단계 단순화)
// 앱 안정화 후 CRDT 등 정교한 전략 검토
function resolveConflict(local: Customer, remote: Customer): Customer { ... }
```

### 2.4 외부 라이브러리 회피
```tsx
// expo-camera SDK 15에서 takePictureAsync에 quality 옵션이 Android 일부 기기에서 무시됨
// → 백엔드에서 다시 압축 (서버 부담 약간 늘지만 안정성 우선)
const photo = await camera.takePictureAsync({ quality: 0.7 });
```

### 2.5 TanStack Query 모바일 설정
```tsx
// 모바일은 백그라운드 → 포그라운드 전환이 잦음
// staleTime 5분으로 잡아서 매번 refetch 안 하게 함
useQuery({
  queryKey: customerKeys.list(filter),
  queryFn: () => customerApi.list(filter),
  networkMode: 'offlineFirst',
  staleTime: 1000 * 60 * 5,
});
```

### 2.6 TODO/FIXME
```tsx
// TODO(#234): 명함 미리보기 zoom 추가
// FIXME(#199): Android 13에서 SafeAreaView 하단 inset 0 이슈
// HACK: Expo Router에서 modal animation 깨져서 useFocusEffect로 우회
// NOTE: 이 컴포넌트는 카메라 권한 있는 경우만 마운트됨 (상위에서 가드)
```

---

## 3. 나쁜 주석 예시

### 3.1 ❌ Native 컴포넌트 설명
```tsx
// ❌
{/* 거래처 리스트 */}
<FlatList data={customers} ... />

// ❌
// 카메라 뷰
<Camera ref={cameraRef} ... />
```

### 3.2 ❌ 권한 처리 절차 설명
```tsx
// ❌
// 1. 권한 요청
// 2. 결과 확인
// 3. 거부 시 안내
async function checkPermission() { ... }
```
→ 함수명이 이미 설명

### 3.3 ❌ Expo Router 사용 설명
```tsx
// ❌
// 이 파일은 /customers 경로에 매칭됨
export default function CustomersScreen() { }
```
→ Expo Router 컨벤션이라 자명

### 3.4 ❌ 주석 처리된 코드
```tsx
// ❌
// const [permission, setPermission] = useState(false);
const { permission, request } = useCameraPermission();
```

---

## 4. JSDoc 사용 정책

### 4.1 사용 경우
- public 훅/컴포넌트가 다른 feature에서 쓰일 때
- 사용 규칙이 명확하지 않을 때

### 4.2 좋은 JSDoc
```tsx
/**
 * 명함 이미지를 캡쳐하고 Supabase Storage에 업로드한 후 OCR을 요청합니다.
 *
 * @remarks
 * - 카메라 권한이 없으면 throw됨 (상위에서 권한 가드 필요)
 * - 네트워크 오프라인이면 mutation 큐에 저장되고 다음 온라인 시 처리됨
 * - OCR 결과는 사용자 확인 단계를 거쳐야 거래처로 등록됨
 */
export function useCaptureAndProcess() { ... }
```

### 4.3 나쁜 JSDoc
```tsx
// ❌ 타입이 이미 설명
/**
 * @param customer 거래처
 * @returns JSX
 */
export function CustomerCard({ customer }: Props) { }
```

---

## 5. 주석 분류 태그

웹/백엔드와 동일:

| 태그 | 의미 | 형식 |
|------|------|------|
| `TODO` | 나중에 | `TODO(#123):` 또는 `TODO(2026-06-01):` |
| `FIXME` | 알려진 버그 | `FIXME(#456):` |
| `HACK` | 의도적 우회 | `HACK: 사유` |
| `NOTE` | 중요 맥락 | `NOTE: 사유` |
| `WARNING` | 위험 | `WARNING: 사유` |

### 5.1 모바일 특화 예시
```tsx
// TODO(#234): iOS 17 Dynamic Island 활용
// FIXME(#199): Android 13에서 SafeArea bottom inset 0
// HACK: Expo Router transition 깨져서 useFocusEffect로 reset
// NOTE: 이 화면은 카메라 권한 있는 사용자만 진입 가능
// WARNING: 이 useEffect 의존성에 navigation 넣으면 무한 루프
```

---

## 6. 모바일 특화 주석이 필요한 영역

### 6.1 권한 처리
권한 거부 시 UX 결정의 이유는 주석 가치 있음

### 6.2 오프라인 동작
충돌 해결 전략, 큐 처리 순서는 코드만으로 안 드러남

### 6.3 플랫폼 차이
iOS/Android 분기는 왜 다른지 짧게

### 6.4 네이티브 라이브러리 버그 회피
라이브러리 이슈 번호와 함께

### 6.5 빌드/배포 설정
app.config.ts의 특이 설정은 한 줄 설명 OK
```typescript
// iOS 16 미만 지원 위해 minVersion 13 (Apple 정책상 최소 2개 메이저 버전)
ios: { deploymentTarget: '13.0' }
```

---

## 7. 검토 체크리스트

PR 리뷰 시:
- [ ] JSX 구조 설명 주석 없는가
- [ ] Native 컴포넌트에 무의미한 주석 없는가
- [ ] 권한/오프라인/플랫폼 분기에 WHY가 있는가
- [ ] TODO/FIXME에 이슈 번호 있는가
- [ ] 라이브러리 회피 코드에 사유가 있는가

---

## 8. AI에게 작업 시킬 때 강조할 것

1. "주석은 기본적으로 쓰지 마라. WHY가 필요한 경우만"
2. "플랫폼 분기(Platform.OS === 'ios')에는 왜 다른지 한 줄"
3. "권한 처리 UX 결정에는 사유 한 줄"
4. "오프라인 동기화 결정에는 트레이드오프 명시"
5. "외부 라이브러리 버그 회피에는 이슈 번호 또는 날짜"
6. "JSX 구조 설명 주석 절대 금지"
