# temperature - Color Temperature

Color temperature read/write support. Color temperature is expressed in Kelvin (K), ranging from 1000–40000K. Low color temperatures are warm (orange-red), while high color temperatures are cool (blue-white).

## Install

```ts
import xcolor from '@xpyjs/color'
import temperaturePlugin from '@xpyjs/color/plugins/temperature'

xcolor.use(temperaturePlugin)
```

## Methods

<SvgTemperatureBar />

### temperature()

Getter/setter mode. Without arguments, returns the approximate color temperature (K) of the current color; with an argument, sets the color based on the color temperature.

#### Read Color Temperature

```ts
xcolor('#ff8000').temperature()   // ≈ 2000 (warm light)
xcolor('#ffffff').temperature()   // ≈ 6500 (daylight)
xcolor('#80b0ff').temperature()   // > 10000 (cool light)
```

#### Set Color Temperature

```ts
xcolor('#000000').temperature(2700).toHex()  // warm white light ≈ '#ffb46b'
xcolor('#000000').temperature(5500).toHex()  // daylight
xcolor('#000000').temperature(9000).toHex()  // cool blue light
```

**Return value**: In getter mode returns `number` (K), in setter mode returns `this`.

## Common Color Temperature Reference

| Color Temperature (K) | Light Source |
| --- | --- |
| 1850 | Candle |
| 2700 | Incandescent lamp |
| 4000 | Fluorescent lamp |
| 5500 | Noon daylight |
| 6500 | Overcast / D65 standard illuminant |
| 9000+ | Blue sky |

## Practical Scenarios

### Simulate Sunrise to Sunset

```ts
const daylight = [2000, 3500, 5500, 7000, 4000, 2500]
const palette = daylight.map(k => xcolor('#fff').temperature(k).toHex())
```
