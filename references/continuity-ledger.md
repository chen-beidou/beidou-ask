# Continuity ledger

<!-- RULE:CONTINUITY.WORLD_FIRST -->
Use for multiple Clips, retries of later shots, or any state that must survive a cut. **World state is authoritative; screen side is only the current camera projection.**

## Track at every Clip boundary

```text
character identity and count
screen side, depth, height, body orientation
optional world position, action-axis id/side, camera side of axis
gaze target and distance
hand use and limb constraints
prop/weapon owner, location, condition
wardrobe, dirt, blood, injury
door, window, light, fire, debris, weather
breath intensity and vocal condition
surface mask, exposed emotion, control strategy
last spoken tail/overlap
unfinished movement
```

Do not show this ledger by default. Render only the facts needed in the next Clip's spatial block and ending state.

## Boundary rule

The first shot of Clip N+1 must begin from Clip N's ending state. It may continue an unfinished motion, hold the state, or show an explicit transition. It may not silently reset position, prop ownership, injury, light, or emotional exposure.

## Motion trajectory ledger (运动轨迹台账)

Position is static; trajectory is the connected path a body traces across cuts. For every Clip with movement, record four facts in the spatial block or shot lines:

1. **Direction** — who moves, toward which side/depth/height (画面左/右/纵深/升降), not just "moves". A left-to-right path keeps running left-to-right in every shot until a shown turn; it never reverses mid-path.
2. **Displacement** — where this Clip starts and ends. Positions across consecutive shots must advance by walked/real distance, never teleport or jump a stage without a shown transition.
3. **Continuation** — is a shot's tail-motion picked up in the next shot's head, or restarted? Cutting on action (a strike, a turn, a reach) keeps the trajectory unbroken. Note the hand-off in the shot line.
4. **Physics / inertia** — for thrown, struck, or falling props and bodies, the launch direction, spin, and landing must be causally consistent. A blade thrown right cannot land left; a body that takes a hit must show the receiving impulse.

**Enter/exit rule:** preserve travel direction, not a mechanically identical edge. For a continuing left-to-right path, a subject typically exits frame right and enters the next setup from frame left while continuing rightward; right-to-left is the inverse. If geography or camera movement makes another entry correct, show the turn/reposition or re-establish the axis explicitly.

Track these just like durable state: they must survive the cut. Do not show the ledger by default; render only the trajectory facts needed in the next Clip's spatial block and ending state.

## Durable versus transient state

Durable: torn clothing, blood, lost/broken weapon, opened door, extinguished light, changed seating, acquired prop, persistent injury.

Transient: blink, brief expression, one breath, hand passing through an arc. Do not invent formal asset names for transient states.

## Ratio variants

16:9 and 9:16 versions may recompose blocking, but story facts and ending state remain equivalent. Document material staging changes when a later Clip depends on them.

## Retry rule

When regenerating one Clip, repeat the minimum incoming boundary state and preserve its outgoing contract. Do not rewrite unaffected Clips unless the repaired state makes them impossible.

## Validator integration

For saved or multi-Clip outputs, the validator now compares world state across adjacent shots rather than only checking whether continuity vocabulary exists. Read `continuity-validator.md` for tracked fields, transition errors, explicit-state annotations, and `--state-report`.

When continuity is important, write exact observable facts (`画面左侧`, `右手持钥匙`, `左肩伤口仍在`, `从左向右移动`) instead of generic phrases such as `保持不变`. The latter are readable to a person but cannot prove a state transition mechanically.


## Scoped transition rule

<!-- RULE:CONTINUITY.EVENT_SCOPE -->
When using hidden validation annotations, bind transition causes to the smallest real target. Prefer `{"type":"turn","entity":"@Mori"}` over a global `"turn"`, `{"type":"prop_damage","prop":"门禁卡"}` over a global damage flag, and `{"type":"scene_change","scene_key":"main_door"}` for durable environment changes. One character's action must never legalize another character's state jump.
