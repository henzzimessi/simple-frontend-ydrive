<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWeekScheduler } from './composables/useWeekScheduler'
import WeekHeader from './components/WeekHeader.vue'
import WeekGrid from './components/WeekGrid.vue'

const {
  weekDays,
  weekRangeLabel,
  totalWeekShifts,
  todayDateKey,
  navigatePrev,
  navigateNext,
  goToToday,
  getShiftsForDay,
  addShift,
  updateShift,
  removeShift,
} = useWeekScheduler()

const transitionDirection = ref<'prev' | 'next' | 'today'>('today')

const transitionName = computed(() => {
  if (transitionDirection.value === 'prev') return 'week-slide-right'
  if (transitionDirection.value === 'next') return 'week-slide-left'
  return 'week-fade'
})

function handlePrev() {
  transitionDirection.value = 'prev'
  navigatePrev()
}

function handleNext() {
  transitionDirection.value = 'next'
  navigateNext()
}

function handleToday() {
  transitionDirection.value = 'today'
  goToToday()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-screen-xl mx-auto px-4 pb-8">
      <header class="mb-2">
        <h1 class="text-2xl font-bold text-gray-900 pt-6 pb-1">Weekly Scheduler</h1>
        <WeekHeader
          :week-range="weekRangeLabel"
          :total-shifts="totalWeekShifts"
          @prev="handlePrev"
          @next="handleNext"
          @today="handleToday"
        />
        <p class="text-xs text-gray-500 text-center">Tip: Double-click a schedule card to edit.</p>
      </header>

      <main>
        <Transition :name="transitionName" mode="out-in">
          <div :key="weekRangeLabel">
            <WeekGrid
              :days="weekDays"
              :today-date-key="todayDateKey"
              :get-shifts-for-day="getShiftsForDay"
              :on-add-shift="addShift"
              :on-update-shift="updateShift"
              :on-remove-shift="removeShift"
            />
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>
