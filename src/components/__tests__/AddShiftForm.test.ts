import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AddShiftForm from "../AddShiftForm.vue";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

describe("AddShiftForm", () => {
  it("submits a valid payload with title and priority", async () => {
    const onSubmit = vi.fn(() => ({ ok: true }));
    const wrapper = mount(AddShiftForm, { props: { onSubmit } });

    await wrapper.find('input[type="text"]').setValue("Morning shift");
    const timeInputs = wrapper.findAll('input[type="time"]');
    await timeInputs[0].setValue("09:00");
    await timeInputs[1].setValue("10:00");
    await wrapper.find("select").setValue("important");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(onSubmit).toHaveBeenCalledWith({
      startMinutes: 540,
      endMinutes: 600,
      title: "Morning shift",
      priority: "important",
    });
  });

  it("disables submit when end time is not after start time", async () => {
    const onSubmit = vi.fn(() => ({ ok: true }));
    const wrapper = mount(AddShiftForm, { props: { onSubmit } });

    const timeInputs = wrapper.findAll('input[type="time"]');
    await timeInputs[0].setValue("10:00");
    await timeInputs[1].setValue("09:00");

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes("disabled")).toBeDefined();
  });

  it("shows server error message on failure", async () => {
    const onSubmit = vi.fn(() => ({ ok: false, error: "Overlap" }));
    const wrapper = mount(AddShiftForm, { props: { onSubmit } });

    const timeInputs = wrapper.findAll('input[type="time"]');
    await timeInputs[0].setValue("09:00");
    await timeInputs[1].setValue("10:00");

    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).toContain("Overlap");
  });
});
