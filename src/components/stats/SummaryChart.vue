<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from 'chart.js'
import type { HourlyLapCount } from '@/composables/useSummary'

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
)

const props = defineProps<{ series: HourlyLapCount[] }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function buildChart(): void {
  if (!canvasEl.value) return
  chart = new Chart(canvasEl.value, {
    data: {
      labels: props.series.map((s) => s.hourLabel),
      datasets: [
        {
          type: 'bar',
          label: '周回数',
          data: props.series.map((s) => s.count),
          backgroundColor: '#4f46e5',
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line',
          label: '平均ラップ(秒)',
          data: props.series.map((s) => (s.avgLapMs !== null ? s.avgLapMs / 1000 : null)),
          borderColor: '#f97316',
          backgroundColor: '#f97316',
          spanGaps: true,
          tension: 0.3,
          pointRadius: 2,
          yAxisID: 'y1',
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: { title: { display: true, text: '開始時刻(JST)' } },
        y: {
          position: 'left',
          title: { display: true, text: '周回数' },
          beginAtZero: true,
          ticks: { precision: 0 },
        },
        y1: {
          position: 'right',
          title: { display: true, text: '平均ラップ(秒)' },
          beginAtZero: true,
          grid: { drawOnChartArea: false },
        },
      },
      plugins: {
        legend: { display: true, position: 'bottom' },
      },
    },
  })
}

onMounted(buildChart)

onUnmounted(() => {
  chart?.destroy()
})

watch(
  () => props.series,
  () => {
    chart?.destroy()
    buildChart()
  },
  { deep: true },
)
</script>

<template>
  <div class="h-56 w-full">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>
