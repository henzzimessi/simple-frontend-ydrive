import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WeekHeader from "../WeekHeader.vue";

describe("WeekHeader", () => {
  it("renders week range and total schedules", () => {
    const wrapper = mount(WeekHeader, {
      props: { weekRange: "Mar 16 – Mar 22, 2026", totalShifts: 3 },
    });

    expect(wrapper.text()).toContain("Mar 16 – Mar 22, 2026");
    expect(wrapper.text()).toContain("Total schedules: 3");
  });

  it("emits navigation actions", async () => {
    const wrapper = mount(WeekHeader, {
      props: { weekRange: "Mar 16 – Mar 22, 2026", totalShifts: 0 },
    });

    await wrapper.find('button[aria-label="Previous week"]').trigger("click");
    await wrapper.find('button[aria-label="Next week"]').trigger("click");
    await wrapper
      .find('button[aria-label="Jump to current week"]')
      .trigger("click");

    expect(wrapper.emitted("prev")).toHaveLength(1);
    expect(wrapper.emitted("next")).toHaveLength(1);
    expect(wrapper.emitted("today")).toHaveLength(1);
  });
});
