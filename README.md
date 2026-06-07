# Handdam

Expo SDK 56, React Native, Expo Router, TypeScript, NativeWind로 구성한 앱 프로젝트입니다.

## 시작하기

```powershell
npm install
npx.cmd expo start --clear
```

실행 중인 Expo CLI에서 Android는 `a`, Web은 `w`를 눌러 열 수 있습니다.

## 명령어

```powershell
npm run start
npm run android
npm run ios
npm run web
npx.cmd tsc --noEmit
```

## 프로젝트 구조

```text
handdam/
├─ assets/                # 아이콘, 이미지 및 기타 정적 파일
├─ src/
│  ├─ app/                # Expo Router 라우트 및 레이아웃
│  ├─ components/         # 앱 전역에서 재사용하는 공통 UI
│  │  └─ ui/              # 도메인에 종속되지 않은 기본 UI
│  ├─ constants/          # 앱 전역 공유 상수
│  ├─ features/           # 기능 및 도메인 단위 코드
│  ├─ hooks/              # 앱 전역에서 재사용하는 React 훅
│  ├─ lib/                # 외부 라이브러리 설정과 공통 유틸리티
│  ├─ stores/             # 앱 전역 공유 상태
│  └─ types/              # 앱 전역 공유 TypeScript 타입
├─ app.json               # Expo 앱 설정
├─ babel.config.js        # Expo 및 NativeWind Babel 설정
├─ global.css             # NativeWind 진입 CSS
├─ metro.config.js        # Expo Metro 및 NativeWind 설정
├─ tailwind.config.js     # NativeWind가 사용하는 Tailwind 설정
└─ tsconfig.json          # TypeScript 및 경로 별칭 설정
```

각 `src` 하위 폴더의 `README.md`에는 해당 폴더의 역할과 코드 배치 기준이 적혀 있습니다.

## 코드 배치 원칙

- `src/app`에는 라우트 구성과 화면 조합만 둡니다.
- 한 기능에 속한 코드는 가능한 한 `src/features/<feature>`에 함께 둡니다.
- 여러 기능에서 재사용되는 코드만 `components`, `hooks`, `lib`, `stores`, `types`로 올립니다.
- `@/` 별칭은 `src/`를 가리킵니다.

## NativeWind

NativeWind 설정에 필요한 다음 파일은 삭제하지 않습니다.

- `babel.config.js`
- `metro.config.js`
- `tailwind.config.js`
- `global.css`
- `nativewind-env.d.ts`

전역 CSS는 `src/app/_layout.tsx`에서 한 번만 import합니다. NativeWind 설정을 변경한 뒤에는 Metro 캐시를 초기화합니다.

```powershell
npx.cmd expo start --clear
```

## 참고 문서

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/)
- [Expo Router](https://docs.expo.dev/versions/v56.0.0/sdk/router/)
- [NativeWind](https://www.nativewind.dev/docs/getting-started/installation)
