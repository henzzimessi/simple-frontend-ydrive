import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ShiftCard from "../ShiftCard.vue";
import type { Shift } from "../../types";

describe("ShiftCard", () => {
  it("renders title and time range", () => {
    const shift: Shift = {
      id: "1",
      startMinutes: 60,
      endMinutes: 120,
      title: "Meeting",
      priority: "important",
    };

    const wrapper = mount(ShiftCard, { props: { shift } });

    expect(wrapper.text()).toContain("Meeting");
    expect(wrapper.text()).toContain("1:00 AM");
    expect(wrapper.text()).toContain("2:00 AM");
  });

  it("applies background based on priority", () => {
    const shift: Shift = {
      id: "1",
      startMinutes: 60,
      endMinutes: 120,
      title: "Urgent task",
      priority: "urgent",
    };

    const wrapper = mount(ShiftCard, { props: { shift } });
    expect(wrapper.classes()).toContain("bg-red-50");
  });
});
