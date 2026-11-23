import { describe, expect, it } from "vitest";
import { widgetSettingEnabled, widgetVisibility } from "../lib/websiteWidgets";

describe("separate website widgets", () => {
  it("honours the consultation off switch independently of the AI chat", () => {
    expect(widgetVisibility(true, widgetSettingEnabled("false", true), false, false)).toEqual({ ai: true, consultation: false, aiOnLeft: false });
  });
  it("shows both launchers on different sides when enabled", () => {
    expect(widgetVisibility(true, widgetSettingEnabled("true", false), false, false)).toEqual({ ai: true, consultation: true, aiOnLeft: true });
  });
  it("hides consultation while the AI chat is open", () => {
    expect(widgetVisibility(true, true, true, false).consultation).toBe(false);
  });
  it("hides the AI chat while consultation is open", () => {
    expect(widgetVisibility(true, true, false, true).ai).toBe(false);
  });
});