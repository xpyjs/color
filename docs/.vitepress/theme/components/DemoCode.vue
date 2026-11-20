<template>
  <div class="example">
    <div class="code-frame">
      <span class="language" aria-hidden="true">ts</span>
      <pre class="vp-code"><code v-if="lines"><span v-for="(line, index) in lines" :key="index" class="code-line"><span
        v-for="token in line"
        :key="token.offset"
        :style="{ '--shiki-light': token.variants.light.color, '--shiki-dark': token.variants.dark.color }"
      >{{ token.content }}</span>{{ index < lines.length - 1 ? '\n' : '' }}</span></code><code v-else>{{ code }}</code></pre>
    </div>
    <button type="button" @click="copy">{{ zh ? '复制代码' : 'Copy code' }}</button>
    <span role="status">{{ status }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const themes = { light: 'github-light', dark: 'github-dark' } as const
const highlighter = shallowRef<Awaited<ReturnType<typeof createHighlighterCore>>>()

const props = defineProps<{ code: string; zh: boolean }>()
const status = ref('')
const lines = computed(() => highlighter.value?.codeToTokensWithThemes(props.code, {
  lang: 'typescript',
  themes,
}))

onMounted(async () => {
  try {
    highlighter.value = await createHighlighterCore({
      langs: [import('shiki/langs/typescript.mjs')],
      themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
      engine: createJavaScriptRegexEngine(),
    })
  } catch (error) {
    console.warn('Unable to load TypeScript highlighting', error)
  }
})
watch(() => props.code, () => { status.value = '' })

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    status.value = props.zh ? '已复制' : 'Copied'
  } catch {
    status.value = props.zh ? '请手动选择并复制代码' : 'Select and copy the code manually'
  }
}
</script>

<style scoped>
.example { min-width: 0; }
.code-frame { position: relative; margin-bottom: 10px; border-radius: 8px; background: var(--vp-code-block-bg); }
.language { position: absolute; top: 6px; right: 10px; color: var(--vp-code-lang-color); font: 12px var(--vp-font-family-mono); }
pre { margin: 0; padding: 22px 14px 12px; line-height: var(--vp-code-line-height); }
pre code { padding: 0; background: transparent; color: var(--vp-c-text-1); white-space: pre-wrap; overflow-wrap: anywhere; font-size: var(--vp-code-font-size); }
button { padding: 4px 10px; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
[role="status"] { margin-inline-start: 8px; font-size: 13px; }
</style>
