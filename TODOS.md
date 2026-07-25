# TODOS

## Re-check npm audit after Expo SDK 54.x patch updates

**What:** After any future `expo install --fix` / SDK 54.x patch bump, re-run
`npm audit` and check whether the moderate advisories below are resolved
upstream.

**Why:** Downgrading from Expo SDK 56 to 54 (2026-06-16) reintroduced 37
moderate npm audit advisories — mainly `postcss <8.5.10` (XSS in CSS
stringify output) and `uuid <11.1.1` (buffer bounds check), both transitive
deps of `@expo/cli` / `@expo/config-plugins` / `xcode` inside
`node_modules/expo/node_modules/...`. These are Expo's build/prebuild
toolchain (metro config, xcode project generation), not code shipped in the
app's runtime bundle, so the immediate user-facing risk is low. SDK 56 had
these fixed; SDK 54.x may pick up backports in later patches.

**Pros:** Keeps the dependency tree clean; avoids carrying known CVEs in CI/
build environments longer than necessary.

**Cons:** `npm audit fix --force` currently wants to jump back to
`expo@56.0.12`, which would undo the SDK 54 pin — not a real fix while on
SDK 54.

**Context:** Introduced while pinning the project to Expo SDK 54
(see plan-eng-review on branch `develop`, 2026-06-16). Run `npm audit` to get
the current count/list — don't trust this TODO's "37" figure, it will drift.

**Depends on / blocked by:** none.

## Expand test coverage beyond the single smoke test

**What:** `src/__tests__/index.test.tsx` is the only test in the project (a
smoke test asserting the home screen redirect renders without crashing). Add
coverage for core flows: routing/navigation, key screens/components, and any
settings or device-API integrations (`expo-constants`, `expo-device`, etc.).

**Why:** With only a smoke test, `npm test` in CI provides almost no
regression protection — most logic changes could break silently and still
pass CI.

**Pros:** Real regression protection for future PRs; CI failures become
meaningful signals instead of rubber stamps.

**Cons:** Meaningful effort to scope and write — needs its own planning pass
(which screens/flows matter most, unit vs. integration vs. E2E).

**Context:** Flagged during plan-eng-review of the Expo SDK 54 downgrade /
CI changes (branch `develop`, 2026-06-16) — out of scope for that change but
worth its own pass.

**Depends on / blocked by:** none.

## Re-verify babel-preset-expo override range on Expo SDK upgrades

**What:** `package.json` pins `"overrides": { "babel-preset-expo": "~54.0.11" }`
to force a single deduped, hoisted copy of `babel-preset-expo` (fixes a jest
module-resolution failure where npm nested it under
`node_modules/expo/node_modules/babel-preset-expo` instead of hoisting it).
On any future Expo SDK bump, check `node_modules/expo/package.json`'s own
`babel-preset-expo` dependency range and update this override to match.

**Why:** The override range is independently versioned from `expo` itself.
If a future `expo` release requires a `babel-preset-expo` range outside
`~54.0.11`, the override could force an incompatible version (or `npm
install` could fail to resolve), reintroducing the jest failure this override
was meant to fix.

**Pros:** Cheap, fast check (`npm ls babel-preset-expo --all` +
`npx expo install --check`) — catches drift before it breaks `npm test`.

**Cons:** Easy to forget since it's a quiet config field; no automated check
currently enforces it.

**Context:** Introduced alongside the Expo SDK 54 downgrade (branch
`develop`, 2026-06-16). `npx expo install --check` in CI may also surface
related drift, but doesn't directly validate this specific override.

**Depends on / blocked by:** none.

## GPS 권한 거부 시 지도 탭으로 안내

**What:** 근처 화면(`(tabs)/photo.tsx`)에서 GPS 권한이 거부됐을 때, 설정 이동 버튼 대신(또는
함께) 위치 없이도 볼 수 있는 지도 탭으로 안내하는 버튼을 추가한다.

**Why:** 지금은 인라인 안내 + 설정 이동 버튼만 제공한다. 위치 권한을 영구 거부한 사용자는 이
화면에서 막다른 상태에 갇힌다.

**Pros:** 권한 거부 사용자도 앱의 다른 가치(지도 탐색)에 계속 접근 가능 — 이탈 방지.

**Cons:** 지금 스코프에는 없는 탭 간 네비게이션 로직이 추가로 필요함.

**Context:** 인증 탭 진입점 설계(office-hours/eng-review/design-review, 2026-07-11)에서
논의됨 — 인라인 거부 상태는 이번 스코프에 포함, 지도 탭 안내는 후속 과제로 분리.

**Depends on / blocked by:** none.
