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
import { useSettings } from '@/composables/useSettings'
import { formatHourlySpeed } from '@/utils/statsDisplay'

const { settings } = useSettings()

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

/** 縦線を引く区切り位置(その直前のラベルとの間に線を描く) */
const BOUNDARY_MARKERS = [
  // 日付の変わり目(23:55枠と00:55枠の間)
  { label: '00:55', color: 'rgba(148, 163, 184, 0.9)', lineWidth: 1 },
  // イベントの日区切り(15:55枠と16:55枠の間 = 16:00)
  { label: '16:55', color: 'rgba(239, 68, 68, 0.9)', lineWidth: 1 },
]

/** 日付・イベント日の区切り位置に縦線を描くプラグイン */
const boundaryLinePlugin = {
  id: 'boundaryLine',
  afterDatasetsDraw(c: Chart): void {
    const labels = c.data.labels as string[] | undefined
    const xScale = c.scales.x
    if (!labels || !xScale) return

    const { ctx, chartArea } = c
    ctx.save()
    ctx.setLineDash([4, 4])

    for (let i = 1; i < labels.length; i++) {
      const marker = BOUNDARY_MARKERS.find((m) => m.label === labels[i])
      if (!marker) continue
      // カテゴリ軸のため、前後の棒の中心の中間を境界位置とする
      const x = (xScale.getPixelForValue(i - 1) + xScale.getPixelForValue(i)) / 2
      ctx.strokeStyle = marker.color
      ctx.lineWidth = marker.lineWidth
      ctx.beginPath()
      ctx.moveTo(x, chartArea.top)
      ctx.lineTo(x, chartArea.bottom)
      ctx.stroke()
    }

    ctx.restore()
  },
}

function buildChart(): void {
  if (!canvasEl.value) return
  chart = new Chart(canvasEl.value, {
    plugins: [boundaryLinePlugin],
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
        x: { title: { display: true, text: '時刻(JST)' } },
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
        tooltip: {
          callbacks: {
            // 周回数の項目に「時速」を併記する(周回数=その枠の時速)
            afterLabel: (ctx) => {
              if (ctx.dataset.label !== '周回数') return undefined
              const count = props.series[ctx.dataIndex]?.count ?? 0
              const pointsPerLap = settings.value.pointsPerLap
              const points = pointsPerLap > 0 ? Math.floor(count) * pointsPerLap : null
              return `時速: ${formatHourlySpeed(points, count)}`
            },
          },
        },
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
