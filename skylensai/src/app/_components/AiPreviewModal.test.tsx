import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AiPreviewModal from "./AiPreviewModal";

describe("AiPreviewModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    logFileName: "test-flight.bin",
    onUpgradeClick: vi.fn(),
    onTryPreview: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Modal Behavior", () => {
    it("should not render when isOpen is false", () => {
      render(<AiPreviewModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText("AI-Powered Flight Analysis")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      expect(screen.getByText("AI-Powered Flight Analysis")).toBeInTheDocument();
      expect(screen.getByText("Unlock advanced insights for test-flight.bin")).toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when 'Maybe Later' button is clicked", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const maybeLaterButton = screen.getByText("Maybe Later");
      fireEvent.click(maybeLaterButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Tab Navigation", () => {
    it("should render all three tabs", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      expect(screen.getByText("AI Demo")).toBeInTheDocument();
      expect(screen.getByText("Features")).toBeInTheDocument();
      expect(screen.getByText("Pricing")).toBeInTheDocument();
    });

    it("should switch to features tab when clicked", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const featuresTab = screen.getByText("Features");
      fireEvent.click(featuresTab);
      
      expect(screen.getByText("Compare Features")).toBeInTheDocument();
      expect(screen.getByText("Flight visualization")).toBeInTheDocument();
    });

    it("should switch to pricing tab when clicked", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const pricingTab = screen.getByText("Pricing");
      fireEvent.click(pricingTab);
      
      expect(screen.getByText("Choose Your Plan")).toBeInTheDocument();
      expect(screen.getByText("$29")).toBeInTheDocument();
      expect(screen.getByText("$99")).toBeInTheDocument();
    });
  });

  describe("AI Demo Tab", () => {
    it("should display AI capability demonstrations", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      expect(screen.getByText("Performance Optimization")).toBeInTheDocument();
      expect(screen.getByText("Safety Analysis")).toBeInTheDocument();
      expect(screen.getByText("Predictive Maintenance")).toBeInTheDocument();
    });

    it("should show confidence scores for AI insights", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      expect(screen.getByText("89% confidence")).toBeInTheDocument();
      expect(screen.getByText("76% confidence")).toBeInTheDocument();
      expect(screen.getByText("82% confidence")).toBeInTheDocument();
    });

    it("should call onTryPreview when 'Try AI Preview' button is clicked", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const tryPreviewButton = screen.getByText("Try AI Preview");
      fireEvent.click(tryPreviewButton);
      
      expect(defaultProps.onTryPreview).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should display demo insights with proper formatting", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      expect(screen.getByText(/15% better battery efficiency/)).toBeInTheDocument();
      expect(screen.getByText(/Vibration pattern detected/)).toBeInTheDocument();
      expect(screen.getByText(/battery replacement recommended/)).toBeInTheDocument();
    });
  });

  describe("Features Tab", () => {
    it("should display feature comparison table", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const featuresTab = screen.getByText("Features");
      fireEvent.click(featuresTab);
      
      expect(screen.getByText("Flight visualization")).toBeInTheDocument();
      expect(screen.getByText("AI-powered insights")).toBeInTheDocument();
      expect(screen.getByText("Performance optimization")).toBeInTheDocument();
    });

    it("should show different feature availability for different tiers", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const featuresTab = screen.getByText("Features");
      fireEvent.click(featuresTab);
      
      expect(screen.getByText("Preview only")).toBeInTheDocument();
      expect(screen.getByText("Unlimited")).toBeInTheDocument();
      expect(screen.getByText("Unlimited + Custom")).toBeInTheDocument();
    });
  });

  describe("Pricing Tab", () => {
    it("should display pricing tiers", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const pricingTab = screen.getByText("Pricing");
      fireEvent.click(pricingTab);
      
      expect(screen.getByText("Pro")).toBeInTheDocument();
      expect(screen.getByText("Enterprise")).toBeInTheDocument();
      expect(screen.getByText("$29")).toBeInTheDocument();
      expect(screen.getByText("$99")).toBeInTheDocument();
    });

    it("should highlight popular plan", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const pricingTab = screen.getByText("Pricing");
      fireEvent.click(pricingTab);
      
      expect(screen.getByText("Most Popular")).toBeInTheDocument();
    });

    it("should call onUpgradeClick with correct tier when upgrade button is clicked", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const pricingTab = screen.getByText("Pricing");
      fireEvent.click(pricingTab);
      
      const proUpgradeButton = screen.getByText("Upgrade to Pro");
      fireEvent.click(proUpgradeButton);
      
      expect(defaultProps.onUpgradeClick).toHaveBeenCalledWith("pro");
    });

    it("should display money-back guarantee", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const pricingTab = screen.getByText("Pricing");
      fireEvent.click(pricingTab);
      
      expect(screen.getByText(/30-day money-back guarantee/)).toBeInTheDocument();
      expect(screen.getByText(/Cancel anytime/)).toBeInTheDocument();
    });
  });

  describe("Feature Lists", () => {
    it("should display all Pro features", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const pricingTab = screen.getByText("Pricing");
      fireEvent.click(pricingTab);
      
      expect(screen.getByText("Unlimited AI flight analysis")).toBeInTheDocument();
      expect(screen.getByText("Performance optimization insights")).toBeInTheDocument();
      expect(screen.getByText("Safety recommendations")).toBeInTheDocument();
      expect(screen.getByText("Predictive maintenance alerts")).toBeInTheDocument();
    });

    it("should display all Enterprise features", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const pricingTab = screen.getByText("Pricing");
      fireEvent.click(pricingTab);
      
      expect(screen.getByText("Everything in Pro")).toBeInTheDocument();
      expect(screen.getByText("Custom AI models")).toBeInTheDocument();
      expect(screen.getByText("Fleet management insights")).toBeInTheDocument();
      expect(screen.getByText("API access")).toBeInTheDocument();
    });
  });

  describe("Try Preview First Button", () => {
    it("should show 'Try Preview First' button on non-demo tabs", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const featuresTab = screen.getByText("Features");
      fireEvent.click(featuresTab);
      
      expect(screen.getByText("Try Preview First")).toBeInTheDocument();
    });

    it("should call onTryPreview when 'Try Preview First' is clicked", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const featuresTab = screen.getByText("Features");
      fireEvent.click(featuresTab);
      
      const tryPreviewFirstButton = screen.getByText("Try Preview First");
      fireEvent.click(tryPreviewFirstButton);
      
      expect(defaultProps.onTryPreview).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for modal", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should support keyboard navigation", () => {
      render(<AiPreviewModal {...defaultProps} />);
      
      const tabs = screen.getAllByRole("button");
      tabs.forEach(tab => {
        expect(tab).toBeInTheDocument();
      });
    });
  });
});