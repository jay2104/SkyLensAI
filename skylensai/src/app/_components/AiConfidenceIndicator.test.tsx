import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AiConfidenceIndicator from "./AiConfidenceIndicator";

const mockMethodology = [
  {
    step: 1,
    title: "Data Validation",
    description: "Verify flight data integrity and completeness",
    confidence: 0.95
  },
  {
    step: 2,
    title: "Pattern Analysis",
    description: "Analyze flight patterns using machine learning",
    confidence: 0.82
  }
];

const mockDataSources = [
  {
    name: "Flight Control Unit",
    type: "sensor" as const,
    reliability: 0.95,
    description: "Primary flight control telemetry"
  },
  {
    name: "Battery Monitoring System",
    type: "sensor" as const,
    reliability: 0.88,
    description: "Real-time battery voltage and current data"
  }
];

describe("AiConfidenceIndicator", () => {
  describe("Confidence Display", () => {
    it("should display high confidence correctly", () => {
      render(<AiConfidenceIndicator confidence={0.85} />);
      
      expect(screen.getByText("High Confidence")).toBeInTheDocument();
      expect(screen.getByText("(85%)")).toBeInTheDocument();
      expect(screen.getByText(/strong data patterns and proven models/)).toBeInTheDocument();
    });

    it("should display medium confidence correctly", () => {
      render(<AiConfidenceIndicator confidence={0.65} />);
      
      expect(screen.getByText("Medium Confidence")).toBeInTheDocument();
      expect(screen.getByText("(65%)")).toBeInTheDocument();
      expect(screen.getByText(/moderate reliability but should be verified/)).toBeInTheDocument();
    });

    it("should display low confidence correctly", () => {
      render(<AiConfidenceIndicator confidence={0.45} />);
      
      expect(screen.getByText("Low Confidence")).toBeInTheDocument();
      expect(screen.getByText("(45%)")).toBeInTheDocument();
      expect(screen.getByText(/limited reliability and requires careful review/)).toBeInTheDocument();
    });

    it("should display very low confidence correctly", () => {
      render(<AiConfidenceIndicator confidence={0.15} />);
      
      expect(screen.getByText("Very Low Confidence")).toBeInTheDocument();
      expect(screen.getByText("(15%)")).toBeInTheDocument();
      expect(screen.getByText(/should be used with extreme caution/)).toBeInTheDocument();
    });
  });

  describe("Expandable Details", () => {
    it("should expand when details button is clicked", () => {
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          methodology={mockMethodology}
          dataSources={mockDataSources}
        />
      );
      
      const detailsButton = screen.getAllByText("Analysis Details")[0];
      fireEvent.click(detailsButton!);
      
      expect(screen.getByText("Methodology")).toBeInTheDocument();
      expect(screen.getByText("Data Sources")).toBeInTheDocument();
      expect(screen.getByText("Limitations")).toBeInTheDocument();
    });

    it("should show methodology details", () => {
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          methodology={mockMethodology}
          showDetails={true}
        />
      );
      
      expect(screen.getByText("Data Validation")).toBeInTheDocument();
      expect(screen.getByText("Pattern Analysis")).toBeInTheDocument();
      expect(screen.getByText("95% reliable")).toBeInTheDocument();
      expect(screen.getByText("82% reliable")).toBeInTheDocument();
    });

    it("should show data sources details", () => {
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          dataSources={mockDataSources}
          showDetails={true}
        />
      );
      
      const sourcesTab = screen.getByText("Data Sources");
      fireEvent.click(sourcesTab);
      
      expect(screen.getByText("Flight Control Unit")).toBeInTheDocument();
      expect(screen.getByText("Battery Monitoring System")).toBeInTheDocument();
      expect(screen.getByText("Primary flight control telemetry")).toBeInTheDocument();
    });

    it("should show limitations by default", () => {
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          showDetails={true}
        />
      );
      
      const limitationsTab = screen.getByText("Limitations");
      fireEvent.click(limitationsTab);
      
      expect(screen.getByText(/AI analysis is based on available data/)).toBeInTheDocument();
      expect(screen.getByText(/should be verified by qualified personnel/)).toBeInTheDocument();
    });
  });

  describe("Learn More Functionality", () => {
    it("should call onLearnMore when learn more button is clicked", () => {
      const onLearnMore = vi.fn();
      
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          onLearnMore={onLearnMore}
        />
      );
      
      const learnMoreButton = screen.getByText("Learn More");
      fireEvent.click(learnMoreButton);
      
      expect(onLearnMore).toHaveBeenCalledTimes(1);
    });

    it("should not show learn more button when onLearnMore is not provided", () => {
      render(<AiConfidenceIndicator confidence={0.85} />);
      
      expect(screen.queryByText("Learn More")).not.toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("should switch between tabs correctly", () => {
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          methodology={mockMethodology}
          dataSources={mockDataSources}
          showDetails={true}
        />
      );
      
      // Start with methodology tab (default)
      expect(screen.getByText("Data Validation")).toBeInTheDocument();
      
      // Switch to data sources
      const sourcesTab = screen.getByText("Data Sources");
      fireEvent.click(sourcesTab);
      expect(screen.getByText("Flight Control Unit")).toBeInTheDocument();
      
      // Switch to limitations
      const limitationsTab = screen.getByText("Limitations");
      fireEvent.click(limitationsTab);
      expect(screen.getByText(/AI analysis is based on available data/)).toBeInTheDocument();
    });

    it("should show item counts in tab labels", () => {
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          methodology={mockMethodology}
          dataSources={mockDataSources}
          showDetails={true}
        />
      );
      
      expect(screen.getByText("(2)")).toBeInTheDocument(); // methodology count
      expect(screen.getByText("(2)")).toBeInTheDocument(); // data sources count
    });
  });

  describe("Visual Elements", () => {
    it("should display confidence bar with correct width", () => {
      render(<AiConfidenceIndicator confidence={0.75} />);
      
      const progressBar = screen.getByText("75%").previousElementSibling?.querySelector("div");
      expect(progressBar).toHaveStyle({ width: "75%" });
    });

    it("should show appropriate colors for different confidence levels", () => {
      const { rerender } = render(<AiConfidenceIndicator confidence={0.85} />);
      expect(screen.getByText("High Confidence")).toBeInTheDocument();
      
      rerender(<AiConfidenceIndicator confidence={0.25} />);
      expect(screen.getByText("Very Low Confidence")).toBeInTheDocument();
    });
  });

  describe("Data Source Types", () => {
    it("should display different data source types correctly", () => {
      const mixedSources = [
        {
          name: "GPS Sensor",
          type: "sensor" as const,
          reliability: 0.9,
          description: "GPS positioning data"
        },
        {
          name: "Flight Pattern AI",
          type: "model" as const,
          reliability: 0.8,
          description: "Machine learning predictions"
        },
        {
          name: "Historical Database",
          type: "historical" as const,
          reliability: 0.7,
          description: "Previous flight patterns"
        }
      ];

      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          dataSources={mixedSources}
          showDetails={true}
        />
      );
      
      const sourcesTab = screen.getByText("Data Sources");
      fireEvent.click(sourcesTab);
      
      expect(screen.getByText("Sensor Data")).toBeInTheDocument();
      expect(screen.getByText("AI Model")).toBeInTheDocument();
      expect(screen.getByText("Historical Data")).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("should show empty state for methodology when none provided", () => {
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          methodology={[]}
          showDetails={true}
        />
      );
      
      expect(screen.getByText("No methodology details available")).toBeInTheDocument();
    });

    it("should show empty state for data sources when none provided", () => {
      render(
        <AiConfidenceIndicator 
          confidence={0.85}
          dataSources={[]}
          showDetails={true}
        />
      );
      
      const sourcesTab = screen.getByText("Data Sources");
      fireEvent.click(sourcesTab);
      
      expect(screen.getByText("No data source information available")).toBeInTheDocument();
    });
  });

  describe("Disclaimer", () => {
    it("should always show the disclaimer footer", () => {
      render(<AiConfidenceIndicator confidence={0.85} />);
      
      expect(screen.getByText(/should always be verified by qualified personnel/)).toBeInTheDocument();
    });
  });
});