// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { isSafeInternalRedirect } from "./useAuth";
import ChatWindow from "@/components/pages/AiChatbox/ChatWindow";
import { ChatUser } from "@/types/aiChatbox";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock permissions
vi.mock("@/hooks/usePermission", () => ({
  usePermission: () => true,
}));

// Mock toast
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("AU13 (P1) - Redirect filter & PII in URL protection (A-H1, A-21)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe("Open redirect filter (A-H1 / AU13)", () => {
    it("refuses /%09/evil.example (tab-encoded URL evasion)", () => {
      expect(isSafeInternalRedirect("/%09/evil.example")).toBe(false);
      expect(isSafeInternalRedirect("/%09evil.example")).toBe(false);
    });

    it("refuses //evil.example (scheme-relative off-site redirect)", () => {
      expect(isSafeInternalRedirect("//evil.example")).toBe(false);
      expect(isSafeInternalRedirect("//google.com/dashboard")).toBe(false);
    });

    it("refuses /\\evil.example (backslash escape off-site redirect)", () => {
      expect(isSafeInternalRedirect("/\\evil.example")).toBe(false);
      expect(isSafeInternalRedirect("/\\google.com")).toBe(false);
      expect(isSafeInternalRedirect("/path\\to\\page")).toBe(false);
    });

    it("refuses other off-site redirect payloads and absolute protocols", () => {
      expect(isSafeInternalRedirect("https://evil.example")).toBe(false);
      expect(isSafeInternalRedirect("http://evil.example")).toBe(false);
      expect(isSafeInternalRedirect("javascript:alert(1)")).toBe(false);
      expect(isSafeInternalRedirect("data:text/html,evil")).toBe(false);
      expect(isSafeInternalRedirect("/\t/evil.example")).toBe(false);
      expect(isSafeInternalRedirect(null)).toBe(false);
      expect(isSafeInternalRedirect(undefined)).toBe(false);
      expect(isSafeInternalRedirect("")).toBe(false);
    });

    it("accepts valid internal relative application routes", () => {
      expect(isSafeInternalRedirect("/dashboard")).toBe(true);
      expect(isSafeInternalRedirect("/leads")).toBe(true);
      expect(isSafeInternalRedirect("/leads/12345")).toBe(true);
      expect(isSafeInternalRedirect("/marketing/campaigns?tab=active")).toBe(true);
      expect(isSafeInternalRedirect("/settings/business")).toBe(true);
    });
  });

  describe("Customer email PII protection in URL (A-21 / AU13)", () => {
    const customerUser: ChatUser = {
      id: "customer_9988",
      name: "Jane Customer",
      email: "jane.customer@example.com",
      lastActive: "Just now",
      human_escalation_required: false,
    };

    it("opens email composer using client state without placing customer email in page address", () => {
      render(
        React.createElement(ChatWindow, {
          user: customerUser,
          messages: [],
          isLoading: false,
          onCloseSession: vi.fn(),
        })
      );

      const sendEmailBtn = screen.getByTitle("Send Email");
      expect(sendEmailBtn).toBeDefined();

      fireEvent.click(sendEmailBtn);

      // Invariant AU13 / A-21: Router destination MUST NOT contain email in URL query string or address
      expect(mockPush).toHaveBeenCalledTimes(1);
      const destinationUrl = mockPush.mock.calls[0][0];

      expect(destinationUrl).toBe("/marketing/email-list/create");
      expect(destinationUrl).not.toContain("jane.customer@example.com");
      expect(destinationUrl).not.toContain("to=");

      // Invariant: Customer email is stored securely in client state for compose page
      expect(sessionStorage.getItem("compose_email_recipient")).toBe(
        "jane.customer@example.com"
      );
    });
  });
});
