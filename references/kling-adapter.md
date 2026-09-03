# Kling adapter (Kling 3.x)

<!-- RULE:LANGUAGE.CONTRACT -->
<!-- RULE:MODEL.CLAIM_PROVENANCE -->

Use this profile only when the selected target is a Kling 3.x interface/version confirmed by the user or current platform. Kling product surfaces can change; treat undocumented prompt-length/action-count formulas as heuristics, not capabilities.

## Prompt structure

Prefer a compact causal order that keeps the subject/action unambiguous and attaches camera motion to its target. A reliable neutral scaffold is:

```
Subject + scene → action/state change → camera/viewpoint → light/look → sound → constraints
```

If the active Kling interface or a current official guide specifies a different syntax, that interface-specific contract wins. Do not claim that camera-first ordering is universally required.

## Density

- Keep one clear objective and one readable causal chain per shot or short generation unit.
- Compress repeated appearance/style wording before removing identity, action cause, contact, result, or endpoint.
- When subject/reference/action density becomes unreliable, split the task or use the interface’s multi-shot/reference controls. Do not enforce an undocumented word, noun, or action-count threshold.

## Camera syntax

Pair a movement with a target — "dollies in on her eyes", not just "dolly in" — and specify the **endpoint** (open-ended motion has a high hang rate).

- Directional language: `slow push in`, `pull back`, `pan left`, `tilt up`.
- Numeric camera control (when the platform exposes it): `camera_control: forward_up`, `advanced_camera_control.movement_type: pan|tilt|zoom`, `movement_value: -5`.
- Intensity adverbs: `gently`, `quickly`, `barely perceptibly`.

## Rules

- **One dominant camera intention per shot.** Default to one clear move or a locked camera for reliability. If a composite path is genuinely needed, stage it as one causal sentence with an explicit trigger, phase hand-off, and endpoint; do not stack unrelated moves.
- Bind camera motion to the visible target and its action; ordering may follow the active interface rather than a universal camera-first rule.
- Chinese and English are both usable; follow the user language and do not claim a language-performance advantage without current evidence.

## Avoid

- Unsupported negative-prompt tricks: use only the controls and syntax exposed by the active Kling interface; do not assume a phrase is ignored without current evidence.
- Stacking unrelated camera moves with no shared viewing task.
- Open-ended motion without a readable endpoint when the endpoint matters to the next state; otherwise a deliberately unresolved move is allowed.

## Multi-shot sequences

For interfaces that expose multi-shot sequencing, keep identity/reference roles and durable world facts stable across cuts while allowing lens, light result, and camera viewpoint to change when the same world state justifies them. Do not repeat attributes that the interface already binds as references.
