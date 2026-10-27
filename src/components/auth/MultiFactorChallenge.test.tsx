// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MultiFactorChallenge } from "./MultiFactorChallenge";
import * as useAuthHook from "@/hooks/useAuth";
import * as authClient from "@/lib/auth-client";

// Mock useAuth
const mockVerifyMfa = vi.fn();
const mockCancelMfa = vi.fn();

vi.mock("@/hooks/usePermission", () => ({
  usePermission: () => true,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    verifyMfa: mockVerifyMfa,
    cancelMfa: mockCancelMfa,
    isAuthenticated: false,
    user: null,
  }),
}));

describe("AU15 (P0) � Multi-factor challenge step in admin sign-in flow", () => {
  const challengeToken = "challenge_jwt_token_xyz123";
  const testEmail = "admin@brightsidecarwash.com";

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("AU15.1: presents the challenge step after password with clean unauthenticated state", () => {
    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
        method="totp"
      />
    );

    // Invariant: Header and instructions are visible
    expect(screen.getByText("Two-Factor Authentication")).toBeDefined();
    expect(
      screen.getByText(/Enter the 6-digit security code from your authenticator app/)
    ).toBeDefined();

    // Invariant: 6-digit input is rendered
    const input = screen.getByLabelText("Authentication Code") as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe("");

    // Invariant: Nothing protected renders; no tokens in client storage
    expect(authClient.getAccessToken()).toBeNull();
    expect(authClient.getRefreshToken()).toBeNull();
  });

  it("AU15.2: verifies a valid code, accepts proof, and triggers onSuccess", async () => {
    mockVerifyMfa.mockResolvedValueOnce({ success: true });
    const onSuccess = vi.fn();

    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Authentication Code");
    fireEvent.change(input, { target: { value: "123456" } });

    const submitBtn = screen.getByRole("button", { name: "Verify Code" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockVerifyMfa).toHaveBeenCalledWith(challengeToken, "123456");
      expect(onSuccess).toHaveBeenCalled();
    });

    // Invariant: code is never stored in storage or URL
    expect(localStorage.getItem("code")).toBeNull();
    expect(sessionStorage.getItem("code")).toBeNull();
    expect(window.location.search).not.toContain("123456");
  });

  it("AU15.3: shows refusal for an invalid code and allows retry", async () => {
    mockVerifyMfa.mockRejectedValueOnce(new Error("Invalid authentication code"));

    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
      />
    );

    const input = screen.getByLabelText("Authentication Code") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "000000" } });

    const submitBtn = screen.getByRole("button", { name: "Verify Code" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(screen.getByText("Invalid authentication code")).toBeDefined();
    });

    // Invariant: code input is cleared for retry
    expect(input.value).toBe("");

    // User can retry entering code
    mockVerifyMfa.mockResolvedValueOnce({ success: true });
    fireEvent.change(input, { target: { value: "654321" } });
    expect(input.value).toBe("654321");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockVerifyMfa).toHaveBeenCalledWith(challengeToken, "654321");
    });
  });

  it("AU15.4: shows refusal for an expired code and allows retry", async () => {
    mockVerifyMfa.mockRejectedValueOnce(
      new Error("MFA challenge has expired. Please request a new code.")
    );

    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
      />
    );

    const input = screen.getByLabelText("Authentication Code");
    fireEvent.change(input, { target: { value: "999999" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(
        screen.getByText("MFA challenge has expired. Please request a new code.")
      ).toBeDefined();
    });
  });

  it("AU15.5: shows refusal for a reused code and allows retry", async () => {
    mockVerifyMfa.mockRejectedValueOnce(
      new Error("Authentication code has already been used.")
    );

    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
      />
    );

    const input = screen.getByLabelText("Authentication Code");
    fireEvent.change(input, { target: { value: "111111" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(
        screen.getByText("Authentication code has already been used.")
      ).toBeDefined();
    });
  });

  it("AU15.6: refuses a code for another account or from another challenge", async () => {
    mockVerifyMfa.mockRejectedValueOnce(
      new Error("Challenge mismatch: code not valid for this account session.")
    );

    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
      />
    );

    const input = screen.getByLabelText("Authentication Code");
    fireEvent.change(input, { target: { value: "222222" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify Code" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
      expect(
        screen.getByText(
          "Challenge mismatch: code not valid for this account session."
        )
      ).toBeDefined();
    });
  });

  it("AU15.7: a client-set flag claiming sign-in is complete changes nothing", () => {
    // Malicious script attempts to set client-side flags to bypass MFA
    localStorage.setItem("mfa_verified", "true");
    localStorage.setItem("isAuthenticated", "true");
    sessionStorage.setItem("user_role", "super_admin");

    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
      />
    );

    // Invariant: UI does NOT grant access, input is still rendered, no valid tokens exist
    expect(screen.getByLabelText("Authentication Code")).toBeDefined();
    expect(authClient.getAccessToken()).toBeNull();
    expect(authClient.isAuthenticated()).toBe(false);
  });

  it("AU15.8: cancel returns to sign-in with no session or token kept", () => {
    const onCancel = vi.fn();

    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
        onCancel={onCancel}
      />
    );

    const cancelBtn = screen.getByRole("button", {
      name: /cancel and return to sign in/i,
    });
    fireEvent.click(cancelBtn);

    // Invariant: cancelMfa called, onCancel callback triggered
    expect(mockCancelMfa).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();

    // Invariant: no session or tokens remain
    expect(authClient.getAccessToken()).toBeNull();
    expect(authClient.getRefreshToken()).toBeNull();
  });

  it("AU15.9: code is never placed in the URL or in storage", () => {
    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
      />
    );

    const input = screen.getByLabelText("Authentication Code");
    fireEvent.change(input, { target: { value: "543210" } });

    // Invariant: Secret code is strictly in React state, not leaked in storage or URL
    expect(localStorage.getItem("code")).toBeNull();
    expect(sessionStorage.getItem("code")).toBeNull();
    expect(window.location.href).not.toContain("543210");
  });
  it("AU15.10: strips non-digit characters and validates strict 6-digit numeric OTP regex", async () => {
    mockVerifyMfa.mockResolvedValueOnce({ success: true });
    const onSuccess = vi.fn();

    render(
      <MultiFactorChallenge
        challengeToken={challengeToken}
        email={testEmail}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText("Authentication Code") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12ab34cd56" } });
    expect(input.value).toBe("123456");

    const submitBtn = screen.getByRole("button", { name: "Verify Code" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockVerifyMfa).toHaveBeenCalledWith(challengeToken, "123456");
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
