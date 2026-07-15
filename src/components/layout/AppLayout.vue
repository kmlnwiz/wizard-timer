<template>
  <div class="mx-auto w-full max-w-[1194px] px-4 pb-8 md:grid md:grid-cols-2 md:gap-6">
    <div class="space-y-4 md:col-span-1">
      <slot name="primary" />
    </div>
    <div class="mt-4 space-y-4 md:col-span-1 md:mt-0">
      <slot name="secondary" />
    </div>
  </div>
</template>
