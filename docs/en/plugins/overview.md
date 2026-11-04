# Plugin Overview

The core library of xcolor covers RGB, HSL, HSV, and Hex formats. Additional color spaces and features are loaded on demand via plugins.

## Installation

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
```

For detailed instructions, refer to the [Plugin System](/en/guide/plugins).

## Find a plugin by task

- Generate palettes and themes · [harmony](/en/plugins/harmony), [gradient](/en/plugins/gradient), [scale](/en/plugins/scale), [palette](/en/plugins/palette), [theme](/en/plugins/theme)
- Compare, composite, and simulate · [a11y](/en/plugins/a11y), [blend](/en/plugins/blend), [simulate](/en/plugins/simulate), [lab](/en/plugins/lab)
- Find names or work with temperature · [name](/en/plugins/name), [temperature](/en/plugins/temperature)
- Convert and format colors · [hwb](/en/plugins/hwb), [cmyk](/en/plugins/cmyk), [oklab](/en/plugins/oklab), [xyz](/en/plugins/xyz), [displayP3](/en/plugins/displayP3), [a98Rgb](/en/plugins/a98Rgb), [proPhotoRgb](/en/plugins/proPhotoRgb), [rec2020](/en/plugins/rec2020), [percentageRgb](/en/plugins/percentageRgb)
