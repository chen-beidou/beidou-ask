# Evidence policy

<!-- RULE:MODEL.CLAIM_PROVENANCE -->

Use this policy for model limits, defect claims, syntax claims, and workaround rules. Keep core cinematic reasoning separate from model-specific evidence.

<!-- RULE:EVIDENCE.LEVELS -->
## Evidence labels

- `[OFFICIAL]` — supported by current first-party model/interface documentation.
- `[FIELD-OBSERVED]` — reproduced in real generations, but not necessarily controlled. Record model/interface/date and enough conditions to reproduce.
- `[CONTROLLED]` — reproduced with a controlled comparison where one relevant variable changed while seed/reference/settings were held as constant as the interface permits.
- `[PARTIAL]` — behavior appears real but only under some conditions or with inconsistent reproduction.
- `[INFERRED]` — plausible from behavior or neighboring evidence but not directly established. Never make this a hard invariant.
- `[EXPERIMENTAL]` — a workaround worth trying on an unverified model. It must stay optional until evidence upgrades it.

<!-- RULE:MODEL.SCOPE -->
## Promotion rule

A model-specific workaround becomes a hard adapter rule only when it is `[OFFICIAL]`, `[CONTROLLED]`, or repeatedly `[FIELD-OBSERVED]` for that same model/interface. Do not transfer defect rules between models by analogy.

## Drift rule

Hosted model behavior changes. When the current interface contradicts an old note, prefer the current interface and downgrade the old rule until re-tested.

## Test record

For every new field rule, append a compact entry to `test-ledger.md`: date, model/interface, task, controlled variable, fixed conditions, result, confidence label, and resulting rule change. Do not claim visual verification unless the rendered output was actually inspected.

## Model capability provenance registry

Exact capability/syntax claims used by adapters are mirrored in `../policies/model-claims.json` with a dated snapshot and source URL. A missing or stale source downgrades the claim to interface-dependent/experimental; it must not silently remain a universal hard rule. Repository validation checks the registry shape and snapshot freshness.
