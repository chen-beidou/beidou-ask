# Continuity ledger

Use for multiple Clips, retries of later shots, or any state that must survive a cut.

## Track at every Clip boundary

```text
character identity and count
screen side, depth, height, body orientation
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

**Enter/exit rule:** a character or prop that exits frame from one side must enter the next frame from the same side unless a shown turn or transition is given.

Track these just like durable state: they must survive the cut. Do not show the ledger by default; render only the trajectory facts needed in the next Clip's spatial block and ending state.

## Durable versus transient state

Durable: torn clothing, blood, lost/broken weapon, opened door, extinguished light, changed seating, acquired prop, persistent injury.

Transient: blink, brief expression, one breath, hand passing through an arc. Do not invent formal asset names for transient states.

## Ratio variants

16:9 and 9:16 versions may recompose blocking, but story facts and ending state remain equivalent. Document material staging changes when a later Clip depends on them.

## Retry rule

When regenerating one Clip, repeat the minimum incoming boundary state and preserve its outgoing contract. Do not rewrite unaffected Clips unless the repaired state makes them impossible.
