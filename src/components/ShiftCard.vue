<script setup lang="ts">
import { minutesToDisplay } from '../lib/shifts'
import type { Shift } from '../types'

const props = defineProps<{ shift: Shift }>()
const emit = defineEmits<{ edit: [shiftId: string] }>()
</script>

<template>
  <div
    class="px-3 py-2 rounded border shadow-sm transition-shadow hover:shadow-md text-sm relative cursor-pointer"
    :class="{
      'border-slate-200 bg-white': (shift.priority ?? 'normal') === 'normal',
      'border-amber-200 bg-amber-50': shift.priority === 'important',
      'border-red-200 bg-red-50': shift.priority === 'urgent',
    }"
    @dblclick="emit('edit', props.shift.id)"
    role="button"
    tabindex="0"
    aria-label="Edit schedule"
  >
    <div class="flex flex-col items-center text-center gap-1">
      <div v-if="shift.title" class="text-sm font-semibold text-gray-900">
        {{ shift.title }}
      </div>
      <div class="text-xs font-semibold text-gray-700">
        {{ minutesToDisplay(shift.startMinutes) }}
        <span class="text-gray-400">–</span>
        {{ minutesToDisplay(shift.endMinutes) }}
      </div>
    </div>
  </div>
</template>
