<template>
  <div
    class="mx-auto w-full max-w-[1194px] px-4 pb-8 pt-4 md:flex md:min-h-0 md:flex-1 md:gap-6 md:pb-4"
  >
    <div class="flex flex-col space-y-4 md:min-h-0 md:w-1/2">
      <slot name="primary" />
    </div>
    <div class="mt-4 space-y-4 md:mt-0 md:min-h-0 md:w-1/2 md:overflow-y-auto">
      <slot name="secondary" />
    </div>
  </div>
</template>
