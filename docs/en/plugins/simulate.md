# simulate

Color blindness simulation for accessibility testing.

## Install

```ts
import simulatePlugin from '@xpyjs/color/plugins/simulate'
xcolor.use(simulatePlugin)
```

## simulate(mode)

<SvgColorBlindness />

Simulate a color vision deficiency. Modifies in place.

| Mode | Description | Prevalence |
| --- | --- | --- |
| `'protanopia'` | Red-blind (no L cones) | ~1% males |
| `'deuteranopia'` | Green-blind (no M cones) | ~1% males |
| `'tritanopia'` | Blue-blind (no S cones) | Rare |
| `'grayscale'` | Total color blindness | — |

```ts
xcolor('#ff0000').clone().simulate('protanopia').toHex()
xcolor('#00ff00').clone().simulate('deuteranopia').toHex()
```
