<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseTimeInput, minutesToTimeInput } from '../lib/shifts'
import type { NewShiftPayload, AddShiftResult, Priority } from '../types'

const props = defineProps<{
  onSubmit: (payload: NewShiftPayload) => AddShiftResult
  initialValues?: Partial<NewShiftPayload>
  submitLabel?: string
  onCancel?: () => void
  onSuccess?: () => void
}>()

const startTime = ref('')
const endTime = ref('')
const title = ref('')
const priority = ref<Priority>('normal')
const serverError = ref('')

const startMinutes = computed(() => parseTimeInput(startTime.value))
const endMinutes = computed(() => parseTimeInput(endTime.value))

const isValid = computed(() => {
  if (startMinutes.value === -1 || endMinutes.value === -1) return false
  return endMinutes.value > startMinutes.value
})

watch(
  () => props.initialValues,
  (values) => {
    if (!values) return
    title.value = values.title ?? ''
    priority.value = values.priority ?? 'normal'
    startTime.value =
      typeof values.startMinutes === 'number'
        ? minutesToTimeInput(values.startMinutes)
        : ''
    endTime.value =
      typeof values.endMinutes === 'number'
        ? minutesToTimeInput(values.endMinutes)
        : ''
  },
  { immediate: true },
)

function handleSubmit() {
  if (!isValid.value) return

  const result = props.onSubmit({
    startMinutes: startMinutes.value,
    endMinutes: endMinutes.value,
    title: title.value.trim() || undefined,
    priority: priority.value,
  })

  if (result.ok) {
    startTime.value = ''
    endTime.value = ''
    title.value = ''
    priority.value = 'normal'
    serverError.value = ''
    props.onSuccess?.()
  } else {
    serverError.value = result.error ?? 'Could not add shift'
  }
}

function clearServerError() {
  serverError.value = ''
}
</script>

<template>
  <form class="mt-3 space-y-2" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-2">
      <div class="min-w-0">
        <label :for="`title-${$.uid}`" class="block text-xs font-medium text-gray-500 mb-1">
          Title (optional)
        </label>
        <input
          :id="`title-${$.uid}`"
          v-model="title"
          type="text"
          maxlength="50"
          placeholder="e.g. Morning shift"
          class="w-full min-w-0 rounded border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          @input="clearServerError"
        />
      </div>
      <div class="min-w-0">
        <label :for="`start-${$.uid}`" class="block text-xs font-medium text-gray-500 mb-1">
          Start
        </label>
        <input
          :id="`start-${$.uid}`"
          v-model="startTime"
          type="time"
          class="w-full min-w-0 rounded border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          @change="clearServerError"
          aria-required="true"
        />
      </div>
      <div class="min-w-0">
        <label :for="`end-${$.uid}`" class="block text-xs font-medium text-gray-500 mb-1">
          End
        </label>
        <input
          :id="`end-${$.uid}`"
          v-model="endTime"
          type="time"
          :min="startTime || undefined"
          class="w-full min-w-0 rounded border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          @change="clearServerError"
          aria-required="true"
        />
      </div>
      <div class="min-w-0">
        <label :for="`priority-${$.uid}`" class="block text-xs font-medium text-gray-500 mb-1">
          Priority
        </label>
        <select
          :id="`priority-${$.uid}`"
          v-model="priority"
          class="w-full min-w-0 rounded border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          @change="clearServerError"
        >
          <option value="normal">Normal</option>
          <option value="important">Important</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
    </div>

    <p v-if="serverError" class="text-xs text-red-600" role="alert">
      {{ serverError }}
    </p>

    <div class="flex gap-2">
      <button
        type="submit"
        :disabled="!isValid"
        class="flex-1 rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
      >
        {{ submitLabel ?? 'Add Shift' }}
      </button>
      <slot name="actions" />
    </div>

    <button
      v-if="onCancel"
      type="button"
      class="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      @click="onCancel"
    >
      Cancel
    </button>
  </form>
</template>
