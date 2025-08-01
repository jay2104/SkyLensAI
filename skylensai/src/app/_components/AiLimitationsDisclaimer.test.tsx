import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AiLimitationsDisclaimer from "./AiLimitationsDisclaimer";

describe("AiLimitationsDisclaimer", () => {
  describe("Inline Variant (Default)", () => {
    it("should render inline disclaimer with default content", () => {
      render(<AiLimitationsDisclaimer />);
      
      expect(screen.getByText("AI Analysis Limitations")).toBeInTheDocument();
      expect(screen.getByText(/AI insights are based on available flight data/)).toBeInTheDocument();
      expect(screen.getByText(/should be verified by qualified aviation professionals/)).toBeInTheDocument();
    });

    it("should hide title when showTitle is false", () => {
      render(<AiLimitationsDisclaimer showTitle={false} />);
      
      expect(screen.queryByText("AI Analysis Limitations")).not.toBeInTheDocument();
    });

    it("should display custom limitation points", () => {
      const customPoints = [
        {
          title: "Custom Warning",
          description: "This is a custom warning message",
          type: "warning" as const
        }
      ];

      render(<AiLimitationsDisclaimer customPoints={customPoints} />);
      
      expect(screen.getByText("Custom Warning:")).toBeInTheDocument();
      expect(screen.getByText("This is a custom warning message")).toBeInTheDocument();
    });

    it("should show full terms link", () => {
      render(<AiLimitationsDisclaimer />);
      
      expect(screen.getByText("Full Terms")).toBeInTheDocument();
    });
  });

  describe("Banner Variant", () => {
    it("should render banner variant correctly", () => {
      render(<AiLimitationsDisclaimer variant="banner" />);
      
      expect(screen.getByText("AI Analysis Disclaimer")).toBeInTheDocument();
      expect(screen.getByText(/AI insights should be verified by qualified personnel/)).toBeInTheDocument();
    });

    it("should call onClose when close button is clicked in banner", () => {
      const onClose = vi.fn();
      
      render(<AiLimitationsDisclaimer variant="banner" onClose={onClose} />);
      
      const closeButton = screen.getByRole("button");
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not show close button when onClose is not provided", () => {
      render(<AiLimitationsDisclaimer variant="banner" />);
      
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("Modal Variant", () => {
    it("should render modal variant correctly", () => {
      render(<AiLimitationsDisclaimer variant="modal" />);
      
      expect(screen.getByText("AI Analysis Disclaimer")).toBeInTheDocument();
      expect(screen.getByText("Important limitations and considerations")).toBeInTheDocument();
      expect(screen.getByText("I understand and accept these limitations")).toBeInTheDocument();
    });

    it("should display all default disclaimer points in modal", () => {
      render(<AiLimitationsDisclaimer variant="modal" />);
      
      expect(screen.getByText("AI Analysis Limitations")).toBeInTheDocument();
      expect(screen.getByText("Professional Verification Required")).toBeInTheDocument();
      expect(screen.getByText("Data Quality Dependency")).toBeInTheDocument();
      expect(screen.getByText("Model Limitations")).toBeInTheDocument();
      expect(screen.getByText("No Liability")).toBeInTheDocument();
    });

    it("should enable continue button only when checkbox is checked", () => {
      render(<AiLimitationsDisclaimer variant="modal" />);
      
      const continueButton = screen.getByText("Continue");
      const checkbox = screen.getByRole("checkbox");
      
      expect(continueButton).toBeDisabled();
      
      fireEvent.click(checkbox);
      
      expect(continueButton).not.toBeDisabled();
    });

    it("should call onAccept when continue button is clicked", () => {
      const onAccept = vi.fn();
      
      render(<AiLimitationsDisclaimer variant="modal" onAccept={onAccept} />);
      
      const checkbox = screen.getByRole("checkbox");
      const continueButton = screen.getByText("Continue");
      
      fireEvent.click(checkbox);
      fireEvent.click(continueButton);
      
      expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when cancel button is clicked", () => {
      const onClose = vi.fn();
      
      render(<AiLimitationsDisclaimer variant="modal" onClose={onClose} />);
      
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when X button is clicked", () => {
      const onClose = vi.fn();
      
      render(<AiLimitationsDisclaimer variant="modal" onClose={onClose} />);
      
      // Find the X button (close button in header)
      const closeButtons = screen.getAllByRole("button");
      const xButton = closeButtons.find(button => button.querySelector("svg"));
      
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("Point Types and Styling", () => {
    it("should render different point types with appropriate styling", () => {
      const mixedPoints = [
        {
          title: "Warning Point",
          description: "This is a warning",
          type: "warning" as const
        },
        {
          title: "Info Point", 
          description: "This is information",
          type: "info" as const
        },
        {
          title: "Critical Point",
          description: "This is critical",
          type: "critical" as const
        }
      ];

      render(<AiLimitationsDisclaimer variant="modal" customPoints={mixedPoints} />);
      
      expect(screen.getByText("Warning Point")).toBeInTheDocument();
      expect(screen.getByText("Info Point")).toBeInTheDocument();
      expect(screen.getByText("Critical Point")).toBeInTheDocument();
    });
  });

  describe("Checkbox Functionality", () => {
    it("should track checkbox state correctly", () => {
      render(<AiLimitationsDisclaimer variant="modal" />);
      
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      
      expect(checkbox.checked).toBe(false);
      
      fireEvent.click(checkbox);
      
      expect(checkbox.checked).toBe(true);
    });

    it("should disable/enable continue button based on checkbox state", () => {
      render(<AiLimitationsDisclaimer variant="modal" />);
      
      const checkbox = screen.getByRole("checkbox");
      const continueButton = screen.getByText("Continue");
      
      expect(continueButton).toHaveClass("cursor-not-allowed");
      
      fireEvent.click(checkbox);
      
      expect(continueButton).not.toHaveClass("cursor-not-allowed");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <AiLimitationsDisclaimer className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for checkbox", () => {
      render(<AiLimitationsDisclaimer variant="modal" />);
      
      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("I understand and accept these limitations");
      
      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it("should have proper button roles", () => {
      render(<AiLimitationsDisclaimer variant="modal" onClose={vi.fn()} />);
      
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Content Truncation", () => {
    it("should show only first 3 points in inline variant", () => {
      const manyPoints = Array.from({ length: 6 }, (_, i) => ({
        title: `Point ${i + 1}`,
        description: `Description ${i + 1}`,
        type: "info" as const
      }));

      render(<AiLimitationsDisclaimer customPoints={manyPoints} />);
      
      expect(screen.getByText("Point 1:")).toBeInTheDocument();
      expect(screen.getByText("Point 2:")).toBeInTheDocument();
      expect(screen.getByText("Point 3:")).toBeInTheDocument();
      expect(screen.queryByText("Point 4:")).not.toBeInTheDocument();
    });
  });
});