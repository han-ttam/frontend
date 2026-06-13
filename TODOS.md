# TODOS

## CI workflow: dedupe shared setup steps

**What:** Extract the `checkout` + `setup-node` + `npm ci` steps shared by the
`lint`, `typecheck`, `test`, and `eas-build` jobs in `.github/workflows/ci.yml`
into a composite action (e.g. `.github/actions/setup-node-env`).

**Why:** As of the EAS build job addition, this same 3-step sequence is
repeated 4 times. Any change (Node version source, cache config, install
flags) now needs 4 edits.

**Pros:** Single source of truth for CI setup; smaller diffs for future
workflow changes.

**Cons:** Adds an indirection (one more file to look at when debugging CI);
minor extra maintenance surface.

**Context:** Introduced while adding the `eas-build` job
(see plan-eng-review on branch `ci-cd-pipeline-setup`, 2026-06-13). Pick this
up if a 5th job is added or the setup steps need to change.

**Depends on / blocked by:** none.
