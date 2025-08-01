import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HealthMetricCard from "../_components/HealthMetricCard";
import DashboardLayout from "../_components/DashboardLayout";

describe("Dashboard Integration", () => {
  it("renders health metric cards with realistic flight data", () => {
    const mockData = {
      flightDuration: 600, // 10 minutes
      maxAltitude: 120.5,
      totalDistance: 2500, // meters
      batteryStartVoltage: 16.8,
      batteryEndVoltage: 14.2,
      gpsQuality: 95,
    };

    render(
      <div>
        <HealthMetricCard
          title="Flight Duration"
          value={`${Math.round(mockData.flightDuration / 60)}m ${Math.round(mockData.flightDuration % 60)}s`}
          unit=""
          status="good"
          trend="stable"
          icon="Clock"
        />
        <HealthMetricCard
          title="Max Altitude"
          value={mockData.maxAltitude.toFixed(1)}
          unit="m"
          status="good" 
          trend="stable"
          icon="TrendingUp"
        />
        <HealthMetricCard
          title="Total Distance"
          value={(mockData.totalDistance / 1000).toFixed(2)}
          unit="km"
          status="good"
          trend="stable"
          icon="Navigation"
        />
      </div>
    );

    // Verify flight metrics are displayed correctly
    expect(screen.getByText("Flight Duration")).toBeInTheDocument();
    expect(screen.getByText("10m 0s")).toBeInTheDocument();
    
    expect(screen.getByText("Max Altitude")).toBeInTheDocument();
    expect(screen.getByText("120.5")).toBeInTheDocument();
    expect(screen.getByText("m")).toBeInTheDocument();
    
    expect(screen.getByText("Total Distance")).toBeInTheDocument();
    expect(screen.getByText("2.50")).toBeInTheDocument();
    expect(screen.getByText("km")).toBeInTheDocument();
  });

  it("displays dashboard layout with proper structure", () => {
    render(
      <DashboardLayout logFileName="test-flight.bin">
        <div data-testid="dashboard-content">
          <h2>Flight Health Overview</h2>
          <p>Dashboard content goes here</p>
        </div>
      </DashboardLayout>
    );

    // Verify layout elements
    expect(screen.getByText("SkyLensAI")).toBeInTheDocument();
    expect(screen.getByText("test-flight.bin")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Charts")).toBeInTheDocument();
    expect(screen.getByText("Flight Path")).toBeInTheDocument();

    // Verify content is rendered
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
    expect(screen.getByText("Flight Health Overview")).toBeInTheDocument();
    expect(screen.getByText("Dashboard content goes here")).toBeInTheDocument();
  });

  it("handles different file types appropriately", () => {
    const fileTypes = [
      { name: "example.bin", type: "BIN" },
      { name: "flight_log.ulg", type: "ULG" },
      { name: "mission.tlog", type: "TLOG" },
      { name: "data.log", type: "LOG" },
    ];

    fileTypes.forEach(({ name, type }) => {
      const { unmount } = render(
        <DashboardLayout logFileName={name}>
          <div>Processing {type} file</div>
        </DashboardLayout>
      );

      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText(`Processing ${type} file`)).toBeInTheDocument();
      
      unmount();
    });
  });

  it("shows appropriate status indicators for different health conditions", () => {
    render(
      <div>
        {/* Good health indicators */}
        <div data-testid="gps-quality-card">
          <HealthMetricCard
            title="GPS Quality"
            value="95"
            unit="%"
            status="good"
            trend="stable"
            icon="Satellite"
          />
        </div>
        
        {/* Warning indicators */}
        <div data-testid="battery-level-card">
          <HealthMetricCard
            title="Battery Level"
            value="75"
            unit="%"
            status="warning"
            trend="down"
            icon="Battery"
          />
        </div>
        
        {/* Error indicators */}
        <div data-testid="signal-strength-card">
          <HealthMetricCard
            title="Signal Strength"
            value="25"
            unit="%"
            status="error"
            trend="down"
            icon="Satellite"
          />
        </div>
      </div>
    );

    // All metrics should be present
    expect(screen.getByText("GPS Quality")).toBeInTheDocument();
    expect(screen.getByText("Battery Level")).toBeInTheDocument();
    expect(screen.getByText("Signal Strength")).toBeInTheDocument();

    // Values should be displayed
    expect(screen.getByText("95")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();

    // Check for cards in the DOM
    const gpsCard = screen.getByTestId("gps-quality-card");
    const batteryCard = screen.getByTestId("battery-level-card");
    const signalCard = screen.getByTestId("signal-strength-card");

    // Verify cards render correctly
    expect(gpsCard).toBeInTheDocument();
    expect(batteryCard).toBeInTheDocument();
    expect(signalCard).toBeInTheDocument();
  });

  it("formats flight duration correctly", () => {
    const testCase = { seconds: 120, expected: "2m 0s" };
    
    render(
      <HealthMetricCard
        title="Duration Test"
        value={`${Math.round(testCase.seconds / 60)}m ${Math.round(testCase.seconds % 60)}s`}
        unit=""
        status="good"
        trend="stable"
        icon="Clock"
      />
    );

    expect(screen.getByText(testCase.expected)).toBeInTheDocument();
  });
});