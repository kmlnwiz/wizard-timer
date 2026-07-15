<script setup lang="ts">
// Zen Maru Gothic は tabular-nums(tnum)を持たないWebフォントのため、
// CSSのfont-variant-numericでは数字幅を揃えられない。文字ごとに固定幅spanで描画して対応する。
defineProps<{ text: string }>()
</script>

<template>
  <span>
    <span
      v-for="(ch, i) in text.split('')"
      :key="i"
      :class="{ 'inline-block text-center': /[0-9]/.test(ch) }"
      :style="/[0-9]/.test(ch) ? 'width: 0.62em' : ''"
      >{{ ch }}</span
    >
  </span>
</template>
