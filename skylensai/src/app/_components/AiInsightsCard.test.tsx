import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AiInsightsCard from "./AiInsightsCard";

const mockInsights = [
  {
    id: "1",
    title: "Battery optimization opportunity",
    description: "Flight pattern suggests 12% battery life extension possible",
    confidence: 0.87,
    category: "efficiency" as const,
    priority: "high" as const
  },
  {
    id: "2",
    title: "GPS signal degradation",
    description: "Intermittent GPS quality drops detected",
    confidence: 0.74,
    category: "maintenance" as const,
    priority: "medium" as const
  },
  {
    id: "3",
    title: "Flight mode analysis",
    description: "Smoother transitions could improve stability",
    confidence: 0.92,
    category: "performance" as const,
    priority: "high" as const
  }
];

describe("AiInsightsCard", () => {
  describe("Free User Experience", () => {
    it("should render AI insights card for free users", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={false}
          sampleInsights={mockInsights}
        />
      );

      expect(screen.getByText("AI Insights")).toBeInTheDocument();
      expect(screen.getByText("Advanced analysis for test-flight.bin")).toBeInTheDocument();
      expect(screen.getByText("Pro Feature")).toBeInTheDocument();
    });

    it("should show sample insights with overlay for free users", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={false}
          sampleInsights={mockInsights}
        />
      );

      expect(screen.getByText("Battery optimization opportunity")).toBeInTheDocument();
      expect(screen.getByText("GPS signal degradation")).toBeInTheDocument();
      
      // Third insight should be hidden initially
      expect(screen.queryByText("Flight mode analysis")).not.toBeInTheDocument();
    });

    it("should expand to show more insights when clicked", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={false}
          sampleInsights={mockInsights}
        />
      );

      const expandButton = screen.getByText("View 1 more insights...");
      fireEvent.click(expandButton);

      expect(screen.getByText("Flight mode analysis")).toBeInTheDocument();
    });

    it("should show upgrade and preview buttons for free users", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={false}
          sampleInsights={mockInsights}
        />
      );

      expect(screen.getByText("Try AI Preview")).toBeInTheDocument();
      expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
    });

    it("should call onUpgradeClick when upgrade button is clicked", () => {
      const onUpgradeClick = vi.fn();
      
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={false}
          sampleInsights={mockInsights}
          onUpgradeClick={onUpgradeClick}
        />
      );

      const upgradeButton = screen.getByText("Upgrade to Pro");
      fireEvent.click(upgradeButton);

      expect(onUpgradeClick).toHaveBeenCalledTimes(1);
    });

    it("should call onPreviewClick when preview button is clicked", () => {
      const onPreviewClick = vi.fn();
      
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={false}
          sampleInsights={mockInsights}
          onPreviewClick={onPreviewClick}
        />
      );

      const previewButton = screen.getByText("Try AI Preview");
      fireEvent.click(previewButton);

      expect(onPreviewClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Pro User Experience", () => {
    it("should render differently for upgraded users", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={true}
          sampleInsights={mockInsights}
        />
      );

      // Should not show Pro Feature badge
      expect(screen.queryByText("Pro Feature")).not.toBeInTheDocument();
      
      // Should show full analysis button instead of upgrade options
      expect(screen.getByText("View Full AI Analysis")).toBeInTheDocument();
      expect(screen.queryByText("Upgrade to Pro")).not.toBeInTheDocument();
    });

    it("should call onPreviewClick when full analysis button is clicked", () => {
      const onPreviewClick = vi.fn();
      
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={true}
          sampleInsights={mockInsights}
          onPreviewClick={onPreviewClick}
        />
      );

      const analysisButton = screen.getByText("View Full AI Analysis");
      fireEvent.click(analysisButton);

      expect(onPreviewClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Insight Display", () => {
    it("should display confidence scores correctly", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          sampleInsights={mockInsights}
        />
      );

      expect(screen.getByText("87%")).toBeInTheDocument(); // High confidence
      expect(screen.getByText("74%")).toBeInTheDocument(); // Medium confidence
    });

    it("should display category labels", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          sampleInsights={mockInsights}
        />
      );

      expect(screen.getByText("Efficiency")).toBeInTheDocument();
      expect(screen.getByText("Maintenance")).toBeInTheDocument();
    });

    it("should display confidence labels correctly", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          sampleInsights={mockInsights}
        />
      );

      expect(screen.getByText("High confidence")).toBeInTheDocument();
      expect(screen.getByText("Medium confidence")).toBeInTheDocument();
    });
  });

  describe("Transparency and Trust", () => {
    it("should show AI limitations disclaimer", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          sampleInsights={mockInsights}
        />
      );

      expect(screen.getByText(/AI insights are based on flight data analysis/)).toBeInTheDocument();
      expect(screen.getByText(/should be verified by qualified personnel/)).toBeInTheDocument();
    });

    it("should show feature benefits for free users", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          isUpgradeUser={false}
          sampleInsights={mockInsights}
        />
      );

      expect(screen.getByText("Performance optimization")).toBeInTheDocument();
      expect(screen.getByText("Safety recommendations")).toBeInTheDocument();
      expect(screen.getByText("Predictive maintenance")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", () => {
      render(
        <AiInsightsCard 
          logFileName="test-flight.bin" 
          sampleInsights={mockInsights}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should be accessible
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });
});