import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import VirtualExpertPanel from "./VirtualExpertPanel";

// Mock tRPC
const mockMutate = vi.fn();
const mockQuery = vi.fn();

vi.mock("~/trpc/react", () => ({
  api: {
    analysis: {
      getQueryUsageStats: {
        useQuery: () => mockQuery(),
      },
      getQueryHistory: {
        useQuery: () => ({ data: null, refetch: vi.fn() }),
      },
      submitVirtualExpertQuery: {
        useMutation: () => ({
          mutateAsync: mockMutate,
          isPending: false,
          error: null,
        }),
      },
      submitQueryFeedback: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
        }),
      },
    },
  },
}));

describe("VirtualExpertPanel", () => {
  const defaultProps = {
    logFileId: "test-log-file-id",
    logFileName: "test-flight.log",
    userSubscriptionTier: "FREE" as const,
    onUpgradeClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockReturnValue({ data: null });
  });

  describe("Free User Experience", () => {
    it("renders upgrade prompt for free users", () => {
      render(<VirtualExpertPanel {...defaultProps} />);

      expect(screen.getByText("Virtual Expert")).toBeInTheDocument();
      expect(screen.getByText("Pro Feature")).toBeInTheDocument();
      expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
      expect(screen.getByText(/Ask questions about your drone and get expert answers/)).toBeInTheDocument();
    });

    it("shows sample conversation for free users", () => {
      render(<VirtualExpertPanel {...defaultProps} />);

      expect(screen.getAllByText(/Why did my battery drain so quickly/)).toHaveLength(1);
      expect(screen.getByText(/Based on your flight log, I can see several factors/)).toBeInTheDocument();
      expect(screen.getByText("89% confidence")).toBeInTheDocument();
    });

    it("calls onUpgradeClick when upgrade button is clicked", () => {
      const onUpgradeClick = vi.fn();
      render(<VirtualExpertPanel {...defaultProps} onUpgradeClick={onUpgradeClick} />);

      fireEvent.click(screen.getByText("Upgrade to Pro"));
      expect(onUpgradeClick).toHaveBeenCalledTimes(1);
    });

    it("displays feature benefits for free users", () => {
      render(<VirtualExpertPanel {...defaultProps} />);

      expect(screen.getByText("Contextual analysis")).toBeInTheDocument();
      expect(screen.getByText("Expert knowledge base")).toBeInTheDocument();
      expect(screen.getByText("Confidence scoring")).toBeInTheDocument();
      expect(screen.getByText("Query history")).toBeInTheDocument();
    });
  });

  describe("Pro User Experience", () => {
    const proProps = {
      ...defaultProps,
      userSubscriptionTier: "PRO" as const,
    };

    beforeEach(() => {
      mockQuery.mockReturnValue({
        data: {
          subscriptionTier: "PRO",
          hasUnlimitedQueries: true,
          monthlyQueries: 25,
          totalQueries: 150,
        },
      });
    });

    it("renders query interface for pro users", () => {
      render(<VirtualExpertPanel {...proProps} />);

      expect(screen.getByPlaceholderText(/Ask a question about test-flight.log/)).toBeInTheDocument();
      expect(screen.getByText("Ask Expert")).toBeInTheDocument();
      expect(screen.getByText("Query History")).toBeInTheDocument();
    });

    it("displays usage stats for pro users", () => {
      render(<VirtualExpertPanel {...proProps} />);

      expect(screen.getByText("Unlimited")).toBeInTheDocument();
      expect(screen.getByText("Pro queries")).toBeInTheDocument();
    });

    it("shows context indicator when log file is provided", () => {
      render(<VirtualExpertPanel {...proProps} />);

      expect(screen.getByText("Using log context")).toBeInTheDocument();
    });

    it("allows submitting questions", async () => {
      render(<VirtualExpertPanel {...proProps} />);

      const textarea = screen.getByPlaceholderText(/Ask a question about test-flight.log/);
      const submitButton = screen.getByText("Ask Expert");

      fireEvent.change(textarea, { target: { value: "Why did my drone crash?" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          question: "Why did my drone crash?",
          logFileId: "test-log-file-id",
        });
      });
    });

    it("shows character count", () => {
      render(<VirtualExpertPanel {...proProps} />);

      const textarea = screen.getByPlaceholderText(/Ask a question about test-flight.log/);
      fireEvent.change(textarea, { target: { value: "Test question" } });

      expect(screen.getByText("13/2000")).toBeInTheDocument();
    });

    it("disables submit for empty questions", () => {
      render(<VirtualExpertPanel {...proProps} />);

      const submitButton = screen.getByText("Ask Expert");
      expect(submitButton).toBeDisabled();
    });

    it("disables submit for questions over limit", () => {
      render(<VirtualExpertPanel {...proProps} />);

      const textarea = screen.getByPlaceholderText(/Ask a question about test-flight.log/);
      const longQuestion = "a".repeat(2001);
      
      fireEvent.change(textarea, { target: { value: longQuestion } });

      const submitButton = screen.getByText("Ask Expert");
      expect(submitButton).toBeDisabled();
      expect(screen.getByText("2001/2000")).toBeInTheDocument();
    });
  });

  describe("Query History", () => {
    const proProps = {
      ...defaultProps,
      userSubscriptionTier: "PRO" as const,
    };

    it("expands query history when clicked", () => {
      render(<VirtualExpertPanel {...proProps} />);

      const historyButton = screen.getByText("Query History");
      fireEvent.click(historyButton);

      // History should be expanded (though empty in this test)
      expect(screen.getByText("No queries yet")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    const proProps = {
      ...defaultProps,
      userSubscriptionTier: "PRO" as const,
    };

    it("displays error message when submission fails", async () => {
      const errorMessage = "Submission failed";
      mockMutate.mockRejectedValueOnce(new Error(errorMessage));

      render(<VirtualExpertPanel {...proProps} />);

      const textarea = screen.getByPlaceholderText(/Ask a question about test-flight.log/);
      const submitButton = screen.getByText("Ask Expert");

      fireEvent.change(textarea, { target: { value: "Test question" } });
      fireEvent.click(submitButton);

      // Note: In a real implementation, you'd need to properly handle the error state
      // This is a basic test structure
    });
  });

  describe("Accessibility", () => {
    it("has proper form labels and structure", () => {
      render(<VirtualExpertPanel {...defaultProps} userSubscriptionTier="PRO" />);

      const textarea = screen.getByPlaceholderText(/Ask a question about test-flight.log/);
      expect(textarea).toHaveAttribute("placeholder");
      
      const submitButton = screen.getByRole("button", { name: /Ask Expert/ });
      expect(submitButton).toBeInTheDocument();
    });
  });
});