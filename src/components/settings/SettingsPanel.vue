<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import KeyBindingSettings from './KeyBindingSettings.vue'
import PointSettings from './PointSettings.vue'
import DataManagementSettings from './DataManagementSettings.vue'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <BaseModal :open="open" title="設定" @close="$emit('close')">
    <div class="space-y-6">
      <KeyBindingSettings />
      <PointSettings />
      <DataManagementSettings />
    </div>
  </BaseModal>
</template>
