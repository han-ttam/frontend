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
