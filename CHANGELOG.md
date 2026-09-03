# Changelog

## v3.0.1 — release hardening

- Added bilingual dialogue extraction for Chinese screenplay quotes, English spoken quotes, and MiniMax H3 `<d>` payloads.
- Added language-aware dialogue-capacity warnings and stricter `--script` verbatim checks.
- Added a real `scripts/release-check.mjs` orchestration entrypoint.
- Repository gate now validates backticked script/reference/policy paths, preventing docs from naming files that do not ship.
- Regression gate increased to 44 fixed/adversarial + 300 mutation cases = 344 validator cases; repository-gate self-tests increased to 9 mutations.

## v3.0.0 — benchmark-hardening

- Added a world-first bilingual continuity compiler with scoped entity/prop/scene transactions and geometry-backed screen projection.
- Added canonical rule registry, model-claim provenance registry, repository consistency gate, mutation self-tests, and a single release check.
- Removed universal camera/power/safe-zone formulas that could conflict with scene causality.
- Added model-syntax precedence so official machine grammars (notably MiniMax H3) compile from the generic director plan without corrupting user-language delivery.
- Replaced undocumented Kling word/noun/action thresholds with interface-dependent density guidance.
- Expanded dialogue validation to bilingual quoted dialogue and kept model defects strictly scoped by evidence.


## 3.0.0 — continuity compiler / consistency-gate upgrade

- Upgraded Validator to bilingual Chinese/English structural and continuity parsing.
- Added relation-aware prop transactions (`actor → prop → target`) so legitimate hand-offs are not misread as teleportation and cannot authorize unrelated third parties.
- Added geometry-backed world-to-screen checks using numeric camera position + target/facing/yaw and explicit world positions.
- Made world state authoritative over screen state during camera changes, preventing 2D continuity rules from fighting valid reprojection.
- Replaced the rigid one-move-per-shot rule with one dominant camera intention; motivated phased composite camera sentences are now allowed.
- Added `policies/canonical-rules.json` as the canonical rule registry and `scripts/validate-repo.mjs` as a release consistency gate.
- Expanded validator tests to 33 fixed/adversarial + 300 mutation = 333 cases.

## 2026-09-03 — continuity state engine v2.1 hardening

- Fixed screen-position/facing role leakage: `位于画面右侧，面向画面左侧` now parses as `screen=right`, `facing=left`.
- Added negation-aware action parsing so `没有转身 / 没有移动 / 没有换手` cannot legalize state changes.
- Replaced global explicit transition authorization with entity/prop/scene-scoped events.
- Legacy string events are scope-inferred only when exactly one target is possible; ambiguous legacy events do not authorize changes.
- Added prop-clause scoping so damage/transfer words attached to one prop cannot legalize another prop.
- Added optional `world_position`, entity `axis_id/axis_side`, camera world state, camera action-axis side, and named axes.
- Added `WORLD_POSITION_JUMP`, `AXIS_ID_JUMP`, `ENTITY_AXIS_SIDE_JUMP`, `CAMERA_AXIS_CROSS`, `CAMERA_AXIS_ID_JUMP`, `LEGACY_EVENT_INFERRED_SCOPE`, and `LEGACY_EVENT_AMBIGUOUS`.
- Expanded validator tests with targeted adversarial cases plus 120 generated mutation cases.

## 2026-09-03 — continuity state engine v2

- Replaced continuity keyword presence checks with a cross-shot world-state comparator.
- Tracks screen side, depth, height, facing, movement direction, posture, frame entry/exit, left/right hand props, durable injuries, wardrobe, gaze, prop condition, and optional durable scene state.
- Added transition findings for motion reversal, screen-position jumps, entry/exit mismatch, unexplained hand swaps, prop teleportation, posture jumps, injury reset/appearance, and facing flips.
- Added conservative natural-language extraction for existing storyboard prose.
- Added optional hidden `CONTINUITY` JSON annotations with explicit transition events for deterministic internal validation without changing the normal user-facing output.
- Added `--state-report <file>` to export the parsed state trace and final world state.
- Added `--strict-continuity` to promote high-confidence continuity warnings to errors for delivery gates.
- Added automated validator regression tests in `scripts/test-validator.mjs`.
- Corrected `output-schema.md` so its per-shot detail rule matches the shot-function-specific policy.

## 2026-09-03 — rule correction pass

- Replaced the universal per-shot three-detail requirement with shot-function-specific checks.
- Replaced the contradictory “new fact + new emotional level” cut rule with a meaningful state-change rule.
- Made asset binding platform-aware: `@Name` is no longer assumed to be universal syntax.
- Scoped Wan 3.0 / MiniMax H3 defect workarounds to the models where they were observed.
- Added `evidence-policy.md` and `test-ledger.md` so empirical rules carry confidence labels and reproduction notes.
- Added `--model` to the validator so model-specific warnings are not applied globally.
- Corrected the validator's action-shot-count floor to match the documented density ranges instead of forcing 10+ shots for every action Clip.
- Relaxed the universal destination-image rule for inserts and cut-on-action bridge shots; they now require a precise hand-off state.

No giant/mecha-specific rules were added.
