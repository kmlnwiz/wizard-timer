<script setup lang="ts">
import { computed } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";

const props = defineProps<{ isRunning: boolean; currentLapElapsedMs: number }>();
const emit = defineEmits<{ toggle: []; resetElapsed: []; startFromZero: [] }>();

// 停止中でも経過秒数が残っている場合は「開始」ではなく「再開」と表示する
const toggleLabel = computed(() =>
  props.isRunning ? "停止" : props.currentLapElapsedMs > 0 ? "再開" : "開始",
);
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <BaseButton
      :variant="isRunning ? 'secondary' : 'primary'"
      @click="emit('toggle')"
    >
      {{ toggleLabel }}
    </BaseButton>
    <BaseButton
      v-if="!isRunning"
      variant="secondary"
      @click="emit('startFromZero')"
      >0秒からスタート</BaseButton
    >
    <BaseButton variant="ghost" @click="emit('resetElapsed')"
      >秒数リセット</BaseButton
    >
  </div>
</template>
