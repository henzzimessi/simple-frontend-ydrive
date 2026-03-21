<script setup lang="ts">
defineProps<{ weekRange: string; totalShifts: number }>()
const emit = defineEmits<{ prev: []; next: []; today: [] }>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 py-4">
    <button
      class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Previous week"
      @click="emit('prev')"
    >
      ← Prev
    </button>

    <div class="flex flex-col items-center gap-2 text-center">
      <h2 class="text-lg font-semibold text-gray-800">
        {{ weekRange }}
      </h2>
      <div class="text-xs font-medium text-gray-500">
        Total schedules: {{ totalShifts }}
      </div>
      <button
        class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Jump to current week"
        @click="emit('today')"
      >
        Today
      </button>
    </div>

    <button
      class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Next week"
      @click="emit('next')"
    >
      Next →
    </button>
  </div>
</template>
