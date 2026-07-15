<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'secondary',
    disabled: false,
    type: 'button',
  },
)

defineEmits<{ click: [MouseEvent] }>()

const variantClasses: Record<string, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-900',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  danger: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300 dark:disabled:bg-red-900',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex h-10 min-w-[6rem] items-center justify-center whitespace-nowrap rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed',
      variantClasses[variant],
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
