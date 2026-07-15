<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton.vue";

defineProps<{ isRunning: boolean }>();
const emit = defineEmits<{ toggle: []; resetElapsed: []; startFromZero: [] }>();
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <BaseButton
      :variant="isRunning ? 'secondary' : 'primary'"
      @click="emit('toggle')"
    >
      {{ isRunning ? "停止" : "開始" }}
    </BaseButton>
    <BaseButton
      v-if="!isRunning"
      variant="secondary"
      @click="emit('startFromZero')"
      >0秒から</BaseButton
    >
    <BaseButton variant="ghost" @click="emit('resetElapsed')"
      >リセット</BaseButton
    >
  </div>
</template>
