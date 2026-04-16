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
xcolor('#ff0000').toLab()     // { l: 53.23, a: 80.11, b: 67.22 }
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
Registering the same plugin multiple times won't throw an error, but it won't install again either — plugins with the same name are only registered once.
:::

## Plugins with Options

Some plugins support configuration options, passed as the second argument to `use()`:

```ts
xcolor.use(somePlugin, { /* options */ })
```

## Official Plugins

### Color Spaces

Extend color input parsing and output formats:

| Plugin | Description |
| --- | --- |
| [cmyk](/en/plugins/cmyk) | CMYK print color space |
| [lab](/en/plugins/lab) | CIE Lab / LCH perceptual color space |
| [hwb](/en/plugins/hwb) | HWB color space |
| [oklab](/en/plugins/oklab) | Oklab / Oklch modern perceptual color space |
| [a98Rgb](/en/plugins/a98Rgb) | Adobe RGB (1998) wide gamut |
| [displayP3](/en/plugins/displayP3) | Display P3 wide gamut |
| [proPhotoRgb](/en/plugins/proPhotoRgb) | ProPhoto RGB wide gamut |
| [rec2020](/en/plugins/rec2020) | Rec. 2020 wide gamut |
| [xyz](/en/plugins/xyz) | CIE XYZ (D65/D50) |
| [name](/en/plugins/name) | CSS color names (148 colors) |

### Utilities

Add new manipulation and query capabilities to color instances:

| Plugin | Description |
| --- | --- |
| [a11y](/en/plugins/a11y) | Accessibility (contrast, readability checks) |
| [blend](/en/plugins/blend) | 11 layer blend modes |
| [gradient](/en/plugins/gradient) | Gradient sequence generation |
| [harmony](/en/plugins/harmony) | Color schemes (complement, triad, tetrad, etc.) |
| [name](/en/plugins/name) | CSS color names (148 colors) |
| [palette](/en/plugins/palette) | Shade palette generation |
| [percentageRgb](/en/plugins/percentageRgb) | Percentage RGB output |
| [scale](/en/plugins/scale) | Color space interpolation and easing |
| [simulate](/en/plugins/simulate) | Color vision deficiency simulation |
| [temperature](/en/plugins/temperature) | Color temperature read and write |
| [theme](/en/plugins/theme) | Theme color generation and CSS variable injection |

## Custom Plugin Development

xcolor's plugin interface is fully open. You can create your own plugins to extend instance methods, register new parsers, or add output formats. See [Custom Plugin Development](/en/guide/custom-plugin) for details.
