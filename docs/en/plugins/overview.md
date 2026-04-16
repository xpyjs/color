# Plugin Overview

The core library of xcolor covers RGB, HSL, HSV, and Hex formats. Additional color spaces and features are loaded on demand via plugins.

## Installation

```ts
import xcolor from '@xpyjs/color'
import labPlugin from '@xpyjs/color/plugins/lab'

xcolor.use(labPlugin)
```

For detailed instructions, refer to the [Plugin System](/en/guide/plugins).
