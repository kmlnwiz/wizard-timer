<script setup lang="ts">
import StatsCard from "./StatsCard.vue";
import { useStats } from "@/composables/useStats";

const { statsList } = useStats();
</script>

<template>
  <div>
    <h2 class="mb-1 text-base font-bold text-gray-900 dark:text-gray-100">
      ラップ統計
    </h2>
    <div>
      <StatsCard v-for="s in statsList" :key="s.rangeLabel" :stats="s" />
    </div>
  </div>
</template>
