<!-- RULE:EVIDENCE.LEVELS -->
# Test ledger

Record empirical model behavior here. This file is evidence, not prompt prose.

## Entry template

```text
Date:
Model / version / interface:
Task:
Reference inputs:
Seed / fixed settings (if exposed):
Variable changed:
Baseline prompt:
Variant prompt:
Observed result:
Repetitions:
Evidence label: [FIELD-OBSERVED] | [CONTROLLED] | [PARTIAL] | [INFERRED]
Rule affected:
Notes / confounds:
```

## Existing observations to preserve

### 2026-08 — Wan 3.0 action density
- Evidence: `[FIELD-OBSERVED]` from user-paid generations.
- Observation: dense multi-exchange fight choreography can collapse into unreadable motion; simpler complete action units with explicit contact/displacement/recovery were more reliable.
- Scope: Wan 3.0 only until independently tested elsewhere.
- Next test: same subject/reference/settings; compare one multi-exchange shot against two single-exchange shots across repeated generations.

### 2026-08 — Wan 3.0 / MiniMax H3 off-screen narration lip movement
- Evidence: `[FIELD-OBSERVED]` from user-paid generations.
- Observation: visible characters may mouth OS/VO audio; explicit closed-mouth/no-lip wording reduced the failure.
- Scope: Wan 3.0 and MiniMax H3 only.
- Next test: baseline vs explicit closed-mouth constraint with fixed visible character/reference and the same narration line.


## 2026-09-03 — validator v3.0.1 deterministic regression evidence
- Evidence: `[CONTROLLED]` local deterministic tests, not video-model behavior.
- Scope: continuity parser/compiler only.
- Coverage: 44 fixed regression/adversarial cases + 300 generated mutation cases = 344 cases.
- Verified failures: position/facing role leakage; Chinese/English hand-state parsing; negated-action false authorization; cross-entity turn/hand-transfer leakage; legitimate two-person prop hand-offs; third-party authorization leaks; cross-prop damage leakage; scene-key leakage; world-position jumps; camera reprojection; world/screen projection mismatch; entity axis-side jumps; camera axis crossing.
- Result: all current validator regression tests pass and the repository consistency gate reports 0 errors / 0 warnings at release time.
- Note: geometry checks are deterministic world-to-screen consistency checks, not video-render evidence and not a full renderer/occlusion engine.

- 2026-09-03: Added English dialogue verbatim/capacity checks plus MiniMax H3 `<d>` dialogue extraction regression cases.
