# constants

앱 전역에서 공유하는 변경되지 않는 값을 관리합니다.

- 색상, 간격, 라우트 이름, 저장소 키처럼 여러 기능에서 공유하는 상수를 둡니다.
- 특정 기능에서만 사용하는 상수는 해당 `features` 폴더에 둡니다.
- 런타임 환경 설정과 비밀 값은 이 폴더에 직접 작성하지 않습니다.

## 색상 사용법

`colors.ts`를 앱 색상의 단일 출처로 사용합니다.

| 이름         | 용도                                    |
| ------------ | --------------------------------------- |
| `background` | 화면의 기본 배경                        |
| `surface`    | 카드, 입력창 등 배경 위에 올라가는 영역 |
| `foreground` | 기본 텍스트와 콘텐츠                    |
| `muted`      | 덜 강조된 텍스트와 콘텐츠               |
| `primary`    | 버튼, 선택 상태 등 주요 강조색          |

`className`을 지원하는 컴포넌트에서는 NativeWind 클래스를 사용합니다.

```tsx
<View className="flex-1 bg-background">
  <View className="bg-surface">
    <Text className="text-foreground">기본 텍스트</Text>
    <Text className="text-muted">보조 텍스트</Text>
  </View>
</View>
```

네비게이션 옵션처럼 `className`을 사용할 수 없는 곳에서는 `colors`를 직접 가져옵니다.

```tsx
import { colors } from "@/constants/colors";

<Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }} />;
```

색상값을 다른 파일에 직접 작성하지 않고 `colors.ts`에 추가하거나 수정합니다.
