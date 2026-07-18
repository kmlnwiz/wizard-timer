<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import { useSettings } from "@/composables/useSettings";
import type { AppSettings } from "@/types/settings";

const { settings, setLapKey, setToggleKey, setStartFromZeroKey } =
  useSettings();

type BindingTarget = "lapKey" | "toggleKey" | "startFromZeroKey";
const listeningFor = ref<BindingTarget | null>(null);

const setters: Record<BindingTarget, (key: string) => void> = {
  lapKey: setLapKey,
  toggleKey: setToggleKey,
  startFromZeroKey: setStartFromZeroKey,
};

function keyLabel(key: string): string {
  if (!key) return "未設定";
  if (key === " ") return "スペース";
  return key;
}

function startListening(target: BindingTarget): void {
  listeningFor.value = target;
  const handler = (e: KeyboardEvent) => {
    e.preventDefault();
    // キャプチャ段階で伝播を止め、グローバルのキーバインド(useKeyBindings)へ
    // このキー入力が伝わって実際の挙動が発火するのを防ぐ
    e.stopImmediatePropagation();
    window.removeEventListener("keydown", handler, true);
    setters[target](e.key);
    listeningFor.value = null;
  };
  window.addEventListener("keydown", handler, true);
}

const rows: { target: BindingTarget; label: string }[] = [
  { target: "lapKey", label: "ラップ" },
  { target: "toggleKey", label: "開始/停止" },
  { target: "startFromZeroKey", label: "0秒から開始" },
];

function currentKey(target: BindingTarget): string {
  return settings.value[target as keyof AppSettings] as string;
}
</script>

<template>
  <div>
    <h3 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
      キーバインド
    </h3>
    <div class="space-y-2">
      <div
        v-for="row in rows"
        :key="row.target"
        class="flex items-center justify-between gap-2"
      >
        <span class="text-sm text-gray-600 dark:text-gray-300">{{
          row.label
        }}</span>
        <BaseButton variant="secondary" @click="startListening(row.target)">
          {{
            listeningFor === row.target
              ? "キーを押してください…"
              : keyLabel(currentKey(row.target))
          }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
