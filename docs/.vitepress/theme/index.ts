import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Playground from './components/Playground.vue'
import ColorVisualizer from './components/ColorVisualizer.vue'
import Toast from './components/Toast.vue'
import HomeHero from './components/HomeHero.vue'
import HomeLayout from './components/HomeLayout.vue'

// SVG illustration components
import SvgLightenDarken from './components/svg/SvgLightenDarken.vue'
import SvgBrighten from './components/svg/SvgBrighten.vue'
import SvgSaturation from './components/svg/SvgSaturation.vue'
import SvgGrayscale from './components/svg/SvgGrayscale.vue'
import SvgColorWheel from './components/svg/SvgColorWheel.vue'
import SvgNegate from './components/svg/SvgNegate.vue'
import SvgAlpha from './components/svg/SvgAlpha.vue'
import SvgMixTintShade from './components/svg/SvgMixTintShade.vue'
import SvgHslCylinder from './components/svg/SvgHslCylinder.vue'
import SvgHsvCone from './components/svg/SvgHsvCone.vue'
import SvgRgbChannels from './components/svg/SvgRgbChannels.vue'
import SvgHarmonySchemes from './components/svg/SvgHarmonySchemes.vue'
import SvgBlendModes from './components/svg/SvgBlendModes.vue'
import SvgGradientBar from './components/svg/SvgGradientBar.vue'
import SvgScaleComparison from './components/svg/SvgScaleComparison.vue'
import SvgColorBlindness from './components/svg/SvgColorBlindness.vue'
import SvgTemperatureBar from './components/svg/SvgTemperatureBar.vue'
import SvgChainFlow from './components/svg/SvgChainFlow.vue'

import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: HomeLayout,
  enhanceApp({ app }) {
    app.component('Playground', Playground)
    app.component('ColorVisualizer', ColorVisualizer)
    app.component('Toast', Toast)
    app.component('HomeHero', HomeHero)

    // SVG illustrations
    app.component('SvgLightenDarken', SvgLightenDarken)
    app.component('SvgBrighten', SvgBrighten)
    app.component('SvgSaturation', SvgSaturation)
    app.component('SvgGrayscale', SvgGrayscale)
    app.component('SvgColorWheel', SvgColorWheel)
    app.component('SvgNegate', SvgNegate)
    app.component('SvgAlpha', SvgAlpha)
    app.component('SvgMixTintShade', SvgMixTintShade)
    app.component('SvgHslCylinder', SvgHslCylinder)
    app.component('SvgHsvCone', SvgHsvCone)
    app.component('SvgRgbChannels', SvgRgbChannels)
    app.component('SvgHarmonySchemes', SvgHarmonySchemes)
    app.component('SvgBlendModes', SvgBlendModes)
    app.component('SvgGradientBar', SvgGradientBar)
    app.component('SvgScaleComparison', SvgScaleComparison)
    app.component('SvgColorBlindness', SvgColorBlindness)
    app.component('SvgTemperatureBar', SvgTemperatureBar)
    app.component('SvgChainFlow', SvgChainFlow)
  }
} satisfies Theme
