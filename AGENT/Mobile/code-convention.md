# Mobile Code Convention

> React Native + Expo + TypeScript 코드 컨벤션
> 웹 프론트와 거의 동일하나 모바일 특화 부분 추가

---

## 1. 파일 명명

### 1.1 파일명: kebab-case + 역할 suffix (웹과 동일)
```
customer-list.tsx                # 화면 또는 컴포넌트
customer-card.tsx
camera-view.tsx
use-camera-permission.ts
business-card.api.ts
mutation-queue.utils.ts
secure-storage.ts
```

### 1.2 Expo Router 라우트 파일
```
app/(tabs)/customers.tsx         # 탭 화면
app/customer/[id].tsx            # 동적 라우트
app/_layout.tsx                  # 레이아웃
```

### 1.3 컴포넌트 export
```typescript
export function CustomerCard({ customer }: Props) { ... }
```
- **named export만** (default 금지)
- 단, Expo Router의 라우트 파일은 **default export 필수**
```typescript
// app/(tabs)/customers.tsx
export default function CustomersScreen() { ... }  // Expo Router 요구사항
```

### 1.4 다른 명명 (변수/함수/상수/타입)
웹 컨벤션과 동일 (camelCase / UPPER_SNAKE_CASE / PascalCase)

---

## 2. TypeScript 규칙

웹 컨벤션과 동일 (strict, any 금지, type vs interface).

### 2.1 React Native 타입
```typescript
import type { ViewProps, TextProps } from 'react-native';

interface CustomerCardProps extends ViewProps {
  customer: Customer;
  onPress?: () => void;
}
```

---

## 3. React Native 컴포넌트 규칙

### 3.1 view, Text 사용
- `<div>` X, `<View>` 사용
- 텍스트는 반드시 `<Text>` 안에
```typescript
// ✅
<View>
  <Text>{customer.name}</Text>
</View>

// ❌ Text 밖의 문자열
<View>{customer.name}</View>
```

### 3.2 onClick 대신 onPress
```typescript
// ✅
<Pressable onPress={handlePress}>
  <Text>Click me</Text>
</Pressable>

// ❌
<Pressable onClick={handlePress}>...</Pressable>
```

### 3.3 Pressable vs TouchableOpacity
- **Pressable** 권장 (더 최신, 유연)
- TouchableOpacity는 레거시 코드만

### 3.4 SafeAreaView 사용
- iOS notch / Android status bar 대응
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomersScreen() {
  return (
    <SafeAreaView className="flex-1">
      <CustomerList />
    </SafeAreaView>
  );
}
```

### 3.5 키보드 처리
```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1"
>
  <Form />
</KeyboardAvoidingView>
```

---

## 4. 리스트 렌더링

### 4.1 FlatList 또는 FlashList
```typescript
// ✅ FlatList (기본)
<FlatList
  data={customers}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <CustomerCard customer={item} />}
  estimatedItemSize={80}
/>

// ✅✅ FlashList (성능 더 좋음, Shopify)
import { FlashList } from '@shopify/flash-list';
```

### 4.2 ScrollView는 적은 항목만
- 10개 미만 + 길이 고정인 경우만
- 그 이상은 FlatList/FlashList

### 4.3 ScrollView 안에 FlatList 금지
- 가상화 안 됨
- `nestedScrollEnabled`로도 비추천

---

## 5. 스타일링 (NativeWind)

### 5.1 className 사용 (Tailwind와 동일)
```typescript
<View className="flex-row items-center gap-2 p-4">
  <Text className="text-base font-semibold">{customer.name}</Text>
</View>
```

### 5.2 StyleSheet 사용 금지 (기본 정책)
- NativeWind로 표현 불가능한 경우만 예외
- 동적 값(애니메이션)은 별도

### 5.3 플랫폼별 스타일
```typescript
<View className="p-4 ios:pt-6 android:pt-4">
```

NativeWind가 plugin으로 지원, 또는 `Platform.select`:
```typescript
import { Platform } from 'react-native';

const offset = Platform.select({ ios: 20, android: 0 });
```

---

## 6. 네이티브 기능

### 6.1 Expo SDK는 shared/native/에서만 import
```typescript
// ❌ 컴포넌트에서 직접
import * as Camera from 'expo-camera';

// ✅ 추상화 통해
import { useCamera } from '@/shared/native/camera';
```

### 6.2 권한 처리
```typescript
const { permission, request } = useCameraPermission();

if (!permission.granted) {
  return (
    <View>
      <Text>카메라 권한이 필요합니다</Text>
      <Button onPress={request} title="권한 요청" />
      <Button onPress={openSettings} title="설정으로 이동" />
    </View>
  );
}
```

### 6.3 보안 저장: expo-secure-store
- 토큰, 비밀번호 등 민감 정보
- AsyncStorage 금지

```typescript
// ✅
await SecureStore.setItemAsync('access_token', token);

// ❌
await AsyncStorage.setItem('access_token', token);
```

---

## 7. 비동기 처리 (웹과 동일)

### 7.1 async/await
```typescript
async function handleSubmit() {
  try {
    await mutate(values);
    router.back();
  } catch (error) {
    showToast('저장 실패', 'error');
  }
}
```

### 7.2 네트워크 상태 확인
```typescript
import NetInfo from '@react-native-community/netinfo';

const { isConnected } = useNetInfo();

if (!isConnected) {
  // 큐에 저장
}
```

---

## 8. TanStack Query 규칙

웹과 동일하나 모바일 추가 설정:

### 8.1 networkMode: 'offlineFirst'
```typescript
useQuery({
  queryKey: customerKeys.list(filter),
  queryFn: () => customerApi.list(filter),
  networkMode: 'offlineFirst',
  staleTime: 1000 * 60 * 5,
});
```

### 8.2 자동 재시도
```typescript
useMutation({
  mutationFn: createCustomer,
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
});
```

### 8.3 앱 포커스 시 refetch
```typescript
// app/_layout.tsx
import { focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
  return () => subscription.remove();
}, []);
```

---

## 9. 폼 (React Hook Form)

### 9.1 웹과 동일하게 사용
```typescript
const form = useForm({ resolver: zodResolver(schema) });
```

### 9.2 입력 컴포넌트
```typescript
import { Controller } from 'react-hook-form';

<Controller
  control={form.control}
  name="name"
  render={({ field }) => (
    <TextInput
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      className="rounded border p-2"
    />
  )}
/>
```

### 9.3 키보드 타입
```typescript
<TextInput
  keyboardType="phone-pad"  // 전화번호
  autoComplete="tel"
  textContentType="telephoneNumber"  // iOS
/>
```

---

## 10. Expo Router 라우팅

### 10.1 화면 이동
```typescript
import { router } from 'expo-router';

router.push('/customer/123');
router.replace('/login');
router.back();
router.dismiss();  // 모달 닫기
```

### 10.2 화면 파라미터
```typescript
import { useLocalSearchParams } from 'expo-router';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useCustomer(id);
  // ...
}
```

### 10.3 Link 컴포넌트
```typescript
import { Link } from 'expo-router';

<Link href={`/customer/${customer.id}`} asChild>
  <Pressable>
    <Text>{customer.name}</Text>
  </Pressable>
</Link>
```

---

## 11. 환경변수

### 11.1 EXPO_PUBLIC_ 접두사
```bash
# .env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SENTRY_DSN=
```

### 11.2 직접 접근 금지, config로
```typescript
// shared/config/env.ts
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL!,
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
} as const;
```

### 11.3 빌드 시점 설정: app.config.ts
```typescript
export default {
  expo: {
    name: process.env.APP_VARIANT === 'dev' ? '영업관리(Dev)' : '영업관리',
    ios: {
      bundleIdentifier: process.env.APP_VARIANT === 'dev'
        ? 'com.yourorg.sales.dev'
        : 'com.yourorg.sales',
    },
    // ...
  },
};
```

---

## 12. 이미지

### 12.1 expo-image 사용 (Image 대신)
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: customer.businessCardUrl }}
  contentFit="cover"
  cachePolicy="memory-disk"
  className="h-32 w-32 rounded"
/>
```

이유: 더 좋은 캐싱, blurhash 지원, 성능

### 12.2 로컬 이미지
```typescript
<Image source={require('@/assets/logo.png')} />
```

---

## 13. import 순서 (웹과 동일)

```typescript
import { useState } from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { useAuth } from '@/features/auth';
import { Button } from '@/shared/ui/button';

import { CustomerCard } from './customer-card';
```

---

## 14. 빌드/배포

### 14.1 패키지 추가 시 항상 expo install
```bash
# ✅
npx expo install expo-camera

# ❌ npm install (호환성 깨질 수 있음)
npm install expo-camera
```

### 14.2 prebuild 사용 시
- 가능한 한 prebuild 없이 (managed workflow)
- prebuild 필요하면 `.gitignore`에 ios/android 추가

---

## 15. 금지 사항 요약

### 15.1 절대 금지
- ❌ `any`
- ❌ default export (라우트 파일 외)
- ❌ AsyncStorage에 토큰 저장
- ❌ Expo SDK 컴포넌트 내 직접 import
- ❌ StyleSheet.create 남용 (NativeWind 사용)
- ❌ ScrollView로 큰 리스트
- ❌ 네이티브 모듈 직접 작성
- ❌ npm install (npx expo install 사용)
- ❌ EXPO_PUBLIC_ 없는 환경변수 클라이언트 사용
- ❌ TouchableOpacity (Pressable 사용)

### 15.2 권장
- ✅ Pressable
- ✅ FlatList / FlashList
- ✅ expo-image
- ✅ SafeAreaView (react-native-safe-area-context)
- ✅ expo-secure-store (토큰)
- ✅ NativeWind className
- ✅ Expo Router 파일 기반 라우팅
- ✅ TanStack Query offlineFirst
