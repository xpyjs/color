# Plugin System

xcolor's core stays lean; advanced features are loaded on demand through plugins.

## Installing Plugins

All official plugins are imported from `@xpyjs/color/plugins/*` and registered via `xcolor.use()`:

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'
import namePlugin from '@xpyjs/color/plugins/name'

xcolor.use(labPlugin)
xcolor.use(namePlugin)
```

After registration, new methods are directly mounted on all xcolor instances:

```ts
xcolor('#ff0000').toLab()     // { l: 53.24, a: 80.09, b: 67.2 }
xcolor('#ff0000').toName()    // 'red'
```

## Registration Timing

`xcolor.use()` is global — after registration, all instances created before and after can use the plugin methods. It's recommended to register uniformly at the application entry:

```ts
// main.ts / index.ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'
import harmonyPlugin from '@xpyjs/color/plugins/harmony'

xcolor.use(labPlugin)
xcolor.use(harmonyPlugin)

// Then use anywhere
```

::: warning
Registering a plugin with an existing name runs its installer again and logs a warning. A successful install replaces the previous parser and formatter registrations.
:::

## Plugins with Options

Some plugins support configuration options, passed as the second argument to `use()`:

```ts
xcolor.use(somePlugin, { /* options */ })
```

## Official Plugins

### Color Spaces

Convert between color spaces, parse color inputs, and format outputs.

| Plugin | Description |
| --- | --- |
| [cmyk](/en/plugins/cmyk) | CMYK print color space |
| [lab](/en/plugins/lab) | CIE Lab / LCH perceptual color space |
| [hsv](/en/plugins/hsv) | HSV input, channel access, and output |
| [hwb](/en/plugins/hwb) | HWB color space |
| [oklab](/en/plugins/oklab) | Oklab / Oklch modern perceptual color space |
| [a98Rgb](/en/plugins/a98Rgb) | Adobe RGB (1998) wide gamut |
| [displayP3](/en/plugins/displayP3) | Display P3 wide gamut |
| [proPhotoRgb](/en/plugins/proPhotoRgb) | ProPhoto RGB wide gamut |
| [rec2020](/en/plugins/rec2020) | Rec. 2020 wide gamut |
| [xyz](/en/plugins/xyz) | CIE XYZ (D65/D50) |
| [colorSpace](/en/plugins/colorSpace) | Preserve the original color space, convert coordinates, map gamuts, compare colors, and create multi-stop gradients |
| [name](/en/plugins/name) | Parse CSS named colors and output matching names |
| [percentageRgb](/en/plugins/percentageRgb) | Format RGB channels as percentages |

### Utilities

Manipulate colors, build palettes and themes, and check readability.

| Plugin | Description |
| --- | --- |
| [a11y](/en/plugins/a11y) | Contrast calculation, readability checks, contrast adjustment, and batch audits |
| [blend](/en/plugins/blend) | Layer blending and Porter–Duff compositing |
| [gradient](/en/plugins/gradient) | Gradient sequences and tonal range generation |
| [harmony](/en/plugins/harmony) | Color schemes (complement, triad, tetrad, etc.) |
| [palette](/en/plugins/palette) | Generate a shade palette from a base color |
| [scale](/en/plugins/scale) | Interpolate in a chosen color space with easing and position sampling |
| [simulate](/en/plugins/simulate) | Color vision deficiency simulation |
| [temperature](/en/plugins/temperature) | Color temperature read and write |
| [theme](/en/plugins/theme) | Generate semantic colors and light and dark themes, then export or inject CSS variables |

## Custom Plugin Development

xcolor's plugin interface is fully open. You can create your own plugins to extend instance methods, register new parsers, or add output formats. See [Custom Plugin Development](/en/guide/custom-plugin) for details.
