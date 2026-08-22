import { describe, expect, it } from "vitest";
import { getAdminLoginErrorMessage } from "./login-error";

describe("getAdminLoginErrorMessage", () => {
  it("reports an unreachable Auth service instead of invalid credentials", () => {
    expect(getAdminLoginErrorMessage({ status: 0 })).toBe(
      "Unable to reach Supabase Auth. Check this device's network connection and try again."
    );
  });

  it("keeps invalid credentials generic when Auth returns a response", () => {
    expect(getAdminLoginErrorMessage({ status: 400 })).toBe("Invalid email or password.");
  });
});
