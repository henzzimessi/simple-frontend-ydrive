import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import DayColumn from "../DayColumn.vue";
import type { Shift } from "../../types";

describe("DayColumn", () => {
  it("shows empty state when no shifts", () => {
    const wrapper = shallowMount(DayColumn, {
      props: {
        date: new Date("2026-03-16T00:00:00"),
        shifts: [],
        isToday: false,
        onAddShift: vi.fn(),
        onUpdateShift: vi.fn(),
        onRemoveShift: vi.fn(),
      },
    });

    expect(wrapper.text()).toContain("No shifts yet");
  });

  it("renders shift cards when shifts exist", () => {
    const shifts: Shift[] = [
      {
        id: "1",
        startMinutes: 60,
        endMinutes: 120,
        title: "Meeting",
        priority: "normal",
      },
    ];

    const wrapper = shallowMount(DayColumn, {
      props: {
        date: new Date("2026-03-16T00:00:00"),
        shifts,
        isToday: false,
        onAddShift: vi.fn(),
        onUpdateShift: vi.fn(),
        onRemoveShift: vi.fn(),
      },
      global: {
        stubs: {
          ShiftCard: { template: '<div class="shift-card-stub" />' },
          AddShiftForm: { template: '<div class="add-shift-stub" />' },
        },
      },
    });

    expect(wrapper.findAll(".shift-card-stub")).toHaveLength(1);
  });

  it("applies today highlight styles", () => {
    const wrapper = shallowMount(DayColumn, {
      props: {
        date: new Date("2026-03-16T00:00:00"),
        shifts: [],
        isToday: true,
        onAddShift: vi.fn(),
        onUpdateShift: vi.fn(),
        onRemoveShift: vi.fn(),
      },
    });

    const header = wrapper.find(".px-3.py-2.text-center");
    expect(header.classes()).toContain("bg-blue-500");
  });
});
