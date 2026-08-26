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

## Durable versus transient state

Durable: torn clothing, blood, lost/broken weapon, opened door, extinguished light, changed seating, acquired prop, persistent injury.

Transient: blink, brief expression, one breath, hand passing through an arc. Do not invent formal asset names for transient states.

## Ratio variants

16:9 and 9:16 versions may recompose blocking, but story facts and ending state remain equivalent. Document material staging changes when a later Clip depends on them.

## Retry rule

When regenerating one Clip, repeat the minimum incoming boundary state and preserve its outgoing contract. Do not rewrite unaffected Clips unless the repaired state makes them impossible.
