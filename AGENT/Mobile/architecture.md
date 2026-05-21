# Mobile Architecture Rules

> React Native + Expo 모바일 앱의 소프트웨어 아키텍처 규칙

---

## 1. 핵심 원칙

### 1.1 웹 프론트와 동일한 FSD 기반
지식/패턴 재사용 위해 웹 프론트와 같은 디렉토리 구조 채택. 차이는 컴포넌트(React Native)와 모바일 특화 기능(카메라, 오프라인, 푸시).

### 1.2 5대 원칙
1. **Feature 단위 분리**: customer, deal, business-card 같은 도메인별 폴더
2. **단방향 의존**: app → pages → features → shared
3. **서버 상태 vs 클라이언트 상태 분리**: TanStack Query vs Zustand
4. **오프라인 우선 (Offline-First)**: 모든 조회는 로컬 캐시 우선
5. **네이티브 기능은 Expo SDK 우선**: 직접 네이티브 모듈 작성 금지

---

## 2. 디렉토리 구조 (Expo Router 기반)

```
src/
├── app/                            # Expo Router (파일 기반 라우팅)
│   ├── _layout.tsx                 # 루트 레이아웃 (Provider)
│   ├── (auth)/                     # 인증 그룹
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                     # 메인 탭
│   │   ├── _layout.tsx
│   │   ├── index.tsx               # 홈
│   │   ├── customers.tsx           # 거래처 리스트
│   │   ├── scan.tsx                # 명함 스캔
│   │   └── settings.tsx
│   ├── customer/
│   │   └── [id].tsx                # 거래처 상세
│   ├── deal/
│   │   └── [id].tsx
│   └── +not-found.tsx
│
├── features/                       # 비즈니스 기능 (웹과 동일 구조)
│   ├── customer/
│   ├── deal/
│   ├── filter/
│   ├── business-card/              # 명함 스캔 + OCR
│   ├── offline-sync/               # 모바일 전용: 오프라인 동기화
│   └── auth/
│
├── shared/
│   ├── ui/                         # 공통 UI 컴포넌트 (Button, Card 등)
│   ├── lib/                        # 유틸
│   ├── api/                        # API client
│   ├── db/                         # expo-sqlite 래퍼
│   ├── storage/                    # expo-secure-store, AsyncStorage 래퍼
│   ├── native/                     # 네이티브 기능 추상 (camera, push)
│   ├── config/
│   ├── hooks/
│   └── types/
│
└── assets/                         # 이미지, 폰트, 아이콘
```

### 2.1 의존성 규칙 (웹과 동일)
```
app(router) ← features ← shared
```

---

## 3. Feature 내부 구조 (예시: business-card)

```
features/business-card/
├── api/
│   ├── business-card.api.ts        # signed URL 요청, OCR 처리 요청
│   ├── use-create-signed-url.ts
│   └── use-process-ocr.ts
│
├── hooks/
│   ├── use-camera-permission.ts
│   ├── use-capture-image.ts        # expo-camera 활용
│   └── use-upload-image.ts         # signed URL로 업로드
│
├── components/
│   ├── camera-view.tsx             # 카메라 화면
│   ├── ocr-result-confirm.tsx      # OCR 결과 확인/수정
│   └── business-card-preview.tsx
│
├── types/
│   └── business-card.types.ts
│
└── index.ts
```

### 3.1 index.ts (public API)
```typescript
export { CameraView, OcrResultConfirm } from './components';
export { useCaptureImage, useUploadImage } from './hooks';
export { useProcessOcr } from './api';
```

---

## 4. 상태 관리

### 4.1 서버 상태: TanStack Query (웹과 동일)
```typescript
export function useCustomers(filter: CustomerFilter) {
  return useQuery({
    queryKey: customerKeys.list(filter),
    queryFn: () => customerApi.list(filter),
    staleTime: 1000 * 60 * 5,
    // 모바일 추가: 오프라인 시 캐시에서만
    networkMode: 'offlineFirst',
  });
}
```

### 4.2 오프라인 캐시: expo-sqlite + TanStack Query persister
```typescript
// shared/db/query-persister.ts
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

// AsyncStorage 기반 (Phase 1)
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24 * 7,  // 7일
});

// Phase 2: 더 큰 데이터는 expo-sqlite로 별도 관리
```

### 4.3 변경 큐 (오프라인 중 변경사항)
```typescript
// features/offline-sync/lib/mutation-queue.ts
interface QueuedMutation {
  id: string;
  type: 'create-customer' | 'update-customer' | ...;
  payload: unknown;
  createdAt: Date;
}

// expo-sqlite에 저장, 온라인 복귀 시 일괄 전송
```

### 4.4 클라이언트 상태: Zustand
```typescript
// shared/stores/auth.store.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

---

## 5. 네이티브 기능 추상화

### 5.1 shared/native/ 에서 추상 인터페이스 정의
```typescript
// shared/native/camera.ts
export interface CameraService {
  requestPermission(): Promise<boolean>;
  captureImage(): Promise<CapturedImage>;
}

// shared/native/camera.impl.ts (Expo 구현)
import * as Camera from 'expo-camera';

export class ExpoCameraService implements CameraService {
  async requestPermission() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  }
  
  async captureImage() { ... }
}
```

### 5.2 왜 추상화?
- 테스트 가능성 (mock)
- 라이브러리 교체 시 영향 최소
- 컴포넌트는 Expo 직접 import 안 함

### 5.3 추상화하는 기능
- 카메라 (`expo-camera`)
- 푸시 알림 (`expo-notifications`)
- 보안 저장 (`expo-secure-store`)
- 파일 시스템 (`expo-file-system`)
- 네트워크 상태 (`@react-native-community/netinfo`)

---

## 6. 라우팅 (Expo Router)

### 6.1 파일 기반 라우팅
```
app/
├── _layout.tsx                 # 루트 레이아웃 (Provider들)
├── (auth)/                     # 그룹 (URL에 안 나타남)
│   ├── _layout.tsx             # auth 화면용 레이아웃
│   ├── login.tsx               # → /login
│   └── signup.tsx              # → /signup
├── (tabs)/                     # 탭 그룹
│   ├── _layout.tsx             # Tabs.Screen
│   ├── index.tsx               # → / (홈)
│   ├── customers.tsx           # → /customers
│   ├── scan.tsx                # → /scan
│   └── settings.tsx
├── customer/
│   └── [id].tsx                # → /customer/123
└── +not-found.tsx
```

### 6.2 인증 보호
```tsx
// app/(tabs)/_layout.tsx
export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <SplashScreen />;
  if (!user) return <Redirect href="/login" />;
  
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="customers" options={{ title: '거래처' }} />
      <Tabs.Screen name="scan" options={{ title: '명함' }} />
      <Tabs.Screen name="settings" options={{ title: '설정' }} />
    </Tabs>
  );
}
```

### 6.3 네비게이션
```typescript
import { router } from 'expo-router';

router.push('/customer/123');
router.replace('/login');
router.back();
```

---

## 7. API 통신

### 7.1 axios 인스턴스 (웹과 거의 동일)
```typescript
// shared/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10_000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken();
      return apiClient.request(error.config);
    }
    return Promise.reject(error);
  },
);
```

### 7.2 토큰 보관: expo-secure-store
- iOS Keychain, Android Keystore 사용
- AsyncStorage 사용 금지 (토큰은)

---

## 8. 오프라인 동기화 전략

### 8.1 조회 (Read)
- TanStack Query + persister로 자동 캐시
- 오프라인 진입 시 캐시에서 응답
- `networkMode: 'offlineFirst'`

### 8.2 쓰기 (Write)
- 온라인: 즉시 API 호출
- 오프라인: 변경 큐에 저장 + Optimistic UI 업데이트
- 온라인 복귀: 큐 일괄 처리

### 8.3 충돌 처리 (Phase 1)
- **last-write-wins** (서버 timestamp 기준)
- 사용자에게는 알림 없이 처리
- 필요 시 더 정교한 전략(CRDT 등) 검토 (앱 안정화 후)

### 8.4 동기화 트리거
```typescript
// shared/hooks/use-network-sync.ts
export function useNetworkSync() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncQueuedMutations();
      }
    });
    return unsubscribe;
  }, []);
}
```

### 8.5 동기화 상태 UI
- 헤더에 동기화 인디케이터
  - 🟢 동기화됨
  - 🟡 동기화 중
  - 🔴 N개 대기 (오프라인)

---

## 9. 명함 스캔 (핵심 기능)

### 9.1 흐름
```
1. 카메라 권한 요청 (앱 첫 실행 시)
2. 카메라 화면 진입 (expo-camera CameraView)
3. 명함 가이드 박스 표시
4. 촬영 → 이미지 임시 저장 (expo-file-system)
5. signed URL 요청 → Supabase Storage 업로드
6. 백엔드에 OCR 처리 요청
7. 결과 화면 (수정 가능)
8. 확정 → 거래처 생성
```

### 9.2 컴포넌트 구조
```typescript
// features/business-card/components/camera-view.tsx
export function CameraView({ onCapture }: Props) {
  const cameraRef = useRef<Camera>(null);
  
  const handleCapture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.7,
      base64: false,
    });
    if (photo) onCapture(photo.uri);
  };
  
  return (
    <Camera ref={cameraRef} style={...}>
      <BusinessCardGuide />
      <CaptureButton onPress={handleCapture} />
    </Camera>
  );
}
```

### 9.3 권한 처리
- 권한 거부 시 명확한 안내 + 설정 앱 이동 버튼
- iOS Info.plist, Android Manifest는 `app.config.ts`에서 관리

---

## 10. 푸시 알림

### 10.1 Expo Notifications 사용
- Phase 1: 기본 셋업만, 실제 알림 발송은 Phase 4(확장 기능)
- 토큰 등록: 앱 시작 시 백엔드로 전송

### 10.2 토큰 관리
```typescript
// shared/native/push.ts
export async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  return token.data;
}
```

---

## 11. 환경변수

### 11.1 EXPO_PUBLIC_ 접두사
```bash
# .env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### 11.2 app.config.ts에서 빌드 분기
```typescript
export default {
  expo: {
    name: process.env.APP_ENV === 'production' ? '영업관리' : '영업관리(Dev)',
    ios: { bundleIdentifier: 'com.yourorg.sales' },
    android: { package: 'com.yourorg.sales' },
    extra: {
      eas: { projectId: '...' },
    },
  },
};
```

---

## 12. 스타일링 (NativeWind)

### 12.1 NativeWind = Tailwind for React Native
- 웹과 동일한 클래스명 사용
- `className` 속성으로

```typescript
import { View, Text } from 'react-native';

export function CustomerCard({ customer }: Props) {
  return (
    <View className="rounded-lg border border-gray-200 p-4">
      <Text className="text-lg font-semibold">{customer.name}</Text>
      <Text className="text-sm text-gray-500">{customer.phone}</Text>
    </View>
  );
}
```

### 12.2 디자인 토큰 공유
- `tailwind.config.js`를 웹과 동일하게 유지 (가능한 한)
- 색상/폰트는 두 플랫폼 일관성 유지

---

## 13. 빌드 & 배포 (EAS)

### 13.1 빌드 프로파일 (eas.json)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  }
}
```

### 13.2 OTA 업데이트
- JS 코드만 변경 시 `eas update --channel production`
- 네이티브 변경 시 새 빌드 + 스토어 재심사

### 13.3 코드사이닝
- iOS: EAS가 자동 관리 (Apple Developer Program 연동)
- Android: EAS가 키스토어 생성/보관

---

## 14. 안티 패턴 (Don't)

### 14.1 ❌ Expo SDK 직접 import (컴포넌트에서)
```tsx
// ❌
import * as Camera from 'expo-camera';

function MyComponent() {
  useEffect(() => {
    Camera.requestCameraPermissionsAsync();
  }, []);
}

// ✅
const { requestPermission } = useCamera();
```

### 14.2 ❌ AsyncStorage에 토큰 저장
```typescript
// ❌
await AsyncStorage.setItem('token', token);

// ✅
await SecureStore.setItemAsync('access_token', token);
```

### 14.3 ❌ 네이티브 모듈 직접 작성
- Phase 1~4에서 절대 금지
- 필요 기능은 Expo SDK / 커뮤니티 라이브러리로 해결
- 정 필요하면 Config Plugin으로

### 14.4 ❌ FlatList 대신 ScrollView로 리스트
- 1000개 이상 가능한 리스트는 FlatList 또는 FlashList

---

## 15. 새 Feature 만들 때 체크리스트

```
☐ features/<name>/ 폴더
☐ api/ - TanStack Query 훅 (offlineFirst 설정)
☐ components/ - React Native 컴포넌트 (NativeWind)
☐ hooks/ - 비즈니스 로직
☐ index.ts - public API
☐ 오프라인 동작 확인 (조회/쓰기)
☐ 권한 필요 시 shared/native/ 에 추상화
```

---

## 16. AI에게 작업 시킬 때 강조할 것

1. "Expo SDK는 shared/native에서 추상화하고, 컴포넌트에선 직접 import 금지"
2. "토큰은 expo-secure-store, AsyncStorage 금지"
3. "리스트는 FlatList 또는 FlashList, ScrollView 금지"
4. "TanStack Query networkMode: 'offlineFirst' 일관 적용"
5. "스타일은 NativeWind className, StyleSheet 금지"
6. "라우팅은 Expo Router 파일 기반"
