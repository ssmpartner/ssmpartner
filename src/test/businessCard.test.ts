import { describe, it, expect } from "vitest";
import { formatSwissPhone, businessCardFileName } from "@/lib/businessCard/layout";
describe("business card", () => {
  it("formats Swiss numbers", () => {
    expect(formatSwissPhone("0774797129")).toBe("+41 77 479 71 29");
    expect(formatSwissPhone("+41774797129")).toBe("+41 77 479 71 29");
    expect(formatSwissPhone("+49 30 123456")).toBe("+49 30 123456");
  });
  it("builds file name", () => {
    expect(businessCardFileName("Bilel Chagra")).toBe("Bilel_Chagra_SSM_85x55mm.pdf");
  });
});
