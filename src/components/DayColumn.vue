<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import ShiftCard from './ShiftCard.vue'
import AddShiftForm from './AddShiftForm.vue'
import type { Shift, NewShiftPayload, AddShiftResult } from '../types'

const props = defineProps<{
  date: Date
  shifts: Shift[]
  isToday: boolean
  onAddShift: (payload: NewShiftPayload) => AddShiftResult
  onUpdateShift: (shiftId: string, payload: NewShiftPayload) => AddShiftResult
  onRemoveShift: (shiftId: string) => void
}>()

const dayLabel = format(props.date, 'EEE')   // e.g. "Mon"
const dateLabel = format(props.date, 'MMM d') // e.g. "Mar 18"
const isAddModalOpen = ref(false)
const editingShiftId = ref<string | null>(null)
const isEditModalOpen = ref(false)

const editingShift = computed(() =>
  props.shifts.find((shift) => shift.id === editingShiftId.value),
)

const dayPriority = computed(() => {
  if (props.shifts.some((shift) => shift.priority === 'urgent')) return 'urgent'
  if (props.shifts.some((shift) => shift.priority === 'important')) return 'important'
  if (props.shifts.length > 0) return 'normal'
  return 'none'
})

const headerClass = computed(() => {
  if (props.isToday) return 'bg-blue-500 text-white ring-2 ring-blue-500'

  switch (dayPriority.value) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-b border-red-200'
    case 'important':
      return 'bg-amber-100 text-amber-800 border-b border-amber-200'
    case 'normal':
      return 'bg-slate-100 text-slate-700 border-b border-slate-200'
    default:
      return 'bg-white border-b border-gray-200 text-gray-700'
  }
})

function startEdit(shiftId: string) {
  editingShiftId.value = shiftId
  isEditModalOpen.value = true
  isAddModalOpen.value = false
}

function cancelEdit() {
  editingShiftId.value = null
  isEditModalOpen.value = false
}

function openAddModal() {
  isAddModalOpen.value = true
  isEditModalOpen.value = false
}

function closeAddModal() {
  isAddModalOpen.value = false
}

function handleAdd(payload: NewShiftPayload) {
  return props.onAddShift(payload)
}

function handleUpdate(payload: NewShiftPayload) {
  if (!editingShift.value) return { ok: false, error: 'Shift not found' }
  const result = props.onUpdateShift(editingShift.value.id, payload)
  if (result.ok) {
    editingShiftId.value = null
    isEditModalOpen.value = false
  }
  return result
}

function handleRemove(shiftId: string) {
  const confirmed = window.confirm('Delete this schedule? This action cannot be undone.')
  if (!confirmed) return

  props.onRemoveShift(shiftId)
  if (editingShiftId.value === shiftId) {
    cancelEdit()
  }
}
</script>

<template>
  <div class="flex flex-col rounded-lg border bg-gray-50 overflow-hidden shadow-sm transition-shadow hover:shadow-md self-start">
    <!-- Day header -->
    <div class="px-3 py-2 text-center" :class="headerClass">
      <div class="text-xs font-semibold uppercase tracking-wide">{{ dayLabel }}</div>
      <div class="text-sm font-medium">{{ dateLabel }}</div>
    </div>

    <!-- Shift list -->
    <div class="flex-1 p-2 space-y-1.5 max-h-48 overflow-y-auto">
      <template v-if="shifts.length > 0">
        <ShiftCard
          v-for="shift in shifts"
          :key="shift.id"
          :shift="shift"
          @edit="startEdit"
        />
      </template>
      <p v-else class="text-xs text-gray-400 text-center py-3 select-none">
        No shifts yet
      </p>
    </div>

    <!-- Add schedule button -->
    <div class="border-t border-gray-200 bg-white p-2">
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-100"
        @click="openAddModal"
      >
        <span class="text-sm">＋</span>
        Add schedule
      </button>
    </div>

    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click="cancelEdit"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-4 shadow-xl" @click.stop>
        <div class="relative">
          <div class="text-center">
            <h3 class="text-sm font-semibold text-gray-900">Edit schedule</h3>
            <p class="text-sm font-semibold text-gray-700">{{ dayLabel }} · {{ dateLabel }}</p>
          </div>
          <button
            type="button"
            class="absolute right-0 top-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            @click="cancelEdit"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div class="mt-3">
          <AddShiftForm
            v-if="editingShift"
            :on-submit="handleUpdate"
            :initial-values="{
              title: editingShift.title,
              startMinutes: editingShift.startMinutes,
              endMinutes: editingShift.endMinutes,
              priority: editingShift.priority,
            }"
            submit-label="Update Shift"
            :on-success="cancelEdit"
          >
            <template #actions>
              <button
                type="button"
                class="flex-1 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                @click="editingShift ? handleRemove(editingShift.id) : undefined"
              >
                Delete
              </button>
            </template>
          </AddShiftForm>
        </div>
      </div>
    </div>

    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click="closeAddModal"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-4 shadow-xl" @click.stop>
        <div class="relative">
          <div class="text-center">
            <h3 class="text-sm font-semibold text-gray-900">Add schedule</h3>
            <p class="text-sm font-semibold text-gray-700">{{ dayLabel }} · {{ dateLabel }}</p>
          </div>
          <button
            type="button"
            class="absolute right-0 top-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            @click="closeAddModal"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div class="mt-3">
          <AddShiftForm
            :on-submit="handleAdd"
            submit-label="Add Shift"
            :on-success="closeAddModal"
          >
            <template #actions>
              <button
                type="button"
                class="flex-1 rounded border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                @click="closeAddModal"
              >
                Cancel
              </button>
            </template>
          </AddShiftForm>
        </div>
      </div>
    </div>
  </div>
</template>
