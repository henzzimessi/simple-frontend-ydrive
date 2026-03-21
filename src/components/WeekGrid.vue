<script setup lang="ts">
import DayColumn from './DayColumn.vue'
import { formatDateKey } from '../lib/dates'
import type { Shift, NewShiftPayload, AddShiftResult } from '../types'

const props = defineProps<{
  days: Date[]
  todayDateKey: string
  getShiftsForDay: (dateKey: string) => Shift[]
  onAddShift: (dateKey: string, payload: NewShiftPayload) => AddShiftResult
  onUpdateShift: (dateKey: string, shiftId: string, payload: NewShiftPayload) => AddShiftResult
  onRemoveShift: (dateKey: string, shiftId: string) => void
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-start">
    <DayColumn
      v-for="day in days"
      :key="formatDateKey(day)"
      :date="day"
      :shifts="getShiftsForDay(formatDateKey(day))"
      :is-today="formatDateKey(day) === todayDateKey"
      :on-add-shift="(payload: NewShiftPayload) => onAddShift(formatDateKey(day), payload)"
      :on-update-shift="(shiftId: string, payload: NewShiftPayload) => onUpdateShift(formatDateKey(day), shiftId, payload)"
      :on-remove-shift="(shiftId: string) => onRemoveShift(formatDateKey(day), shiftId)"
    />
  </div>
</template>
