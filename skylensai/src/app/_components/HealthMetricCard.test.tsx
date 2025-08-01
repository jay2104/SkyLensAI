import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HealthMetricCard, { BatteryHealthCard, GPSQualityCard } from "./HealthMetricCard";

describe("HealthMetricCard", () => {
  const defaultProps = {
    title: "Test Metric",
    value: "100",
    unit: "m",
    status: "good" as const,
    trend: "stable" as const,
    icon: "Clock" as const,
  };

  it("renders with basic props", () => {
    render(<HealthMetricCard {...defaultProps} />);
    
    expect(screen.getByText("Test Metric")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("m")).toBeInTheDocument();
    expect(screen.getByText("Stable")).toBeInTheDocument();
  });

  it("shows different status colors", () => {
    const { rerender, container } = render(<HealthMetricCard {...defaultProps} status="good" />);
    expect(container.firstChild).toHaveClass("border-green-200");

    rerender(<HealthMetricCard {...defaultProps} status="warning" />);
    expect(container.firstChild).toHaveClass("border-amber-200");

    rerender(<HealthMetricCard {...defaultProps} status="error" />);
    expect(container.firstChild).toHaveClass("border-red-200");
  });

  it("shows different trend indicators", () => {
    const { rerender } = render(<HealthMetricCard {...defaultProps} trend="up" />);
    expect(screen.getByText("Trending up")).toBeInTheDocument();

    rerender(<HealthMetricCard {...defaultProps} trend="down" />);
    expect(screen.getByText("Trending down")).toBeInTheDocument();

    rerender(<HealthMetricCard {...defaultProps} trend="stable" />);
    expect(screen.getAllByText("Stable").length).toBeGreaterThan(0);
  });

  it("handles click interactions", () => {
    const handleClick = vi.fn();
    const { container } = render(<HealthMetricCard {...defaultProps} onClick={handleClick} />);
    
    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders subtitle when provided", () => {
    render(<HealthMetricCard {...defaultProps} subtitle="Test subtitle" />);
    expect(screen.getByText("Test subtitle")).toBeInTheDocument();
  });

  it("does not have click handler when onClick is not provided", () => {
    const { container } = render(<HealthMetricCard {...defaultProps} />);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass("cursor-pointer");
  });
});

describe("BatteryHealthCard", () => {
  it("calculates battery percentage correctly", () => {
    render(<BatteryHealthCard startVoltage={16.8} endVoltage={14.2} />);
    
    expect(screen.getByText("Battery Consumption")).toBeInTheDocument();
    expect(screen.getByText("15.5")).toBeInTheDocument(); // (16.8-14.2)/16.8 * 100 = 15.5%
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByText("16.8V → 14.2V")).toBeInTheDocument();
  });

  it("shows correct status based on battery usage", () => {
    // Good status (< 60% usage)
    const { rerender, container } = render(<BatteryHealthCard startVoltage={20} endVoltage={15} />); // 25% usage
    expect(container.firstChild).toHaveClass("border-green-200");

    // Warning status (60-80% usage)
    rerender(<BatteryHealthCard startVoltage={20} endVoltage={5} />); // 75% usage
    expect(container.firstChild).toHaveClass("border-amber-200");

    // Error status (> 80% usage)
    rerender(<BatteryHealthCard startVoltage={20} endVoltage={2} />); // 90% usage
    expect(container.firstChild).toHaveClass("border-red-200");
  });
});

describe("GPSQualityCard", () => {
  it("renders GPS quality correctly", () => {
    render(<GPSQualityCard quality={85} />);
    
    expect(screen.getByText("GPS Signal Quality")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getAllByText("%").length).toBeGreaterThan(0);
    expect(screen.getByText("Average signal strength")).toBeInTheDocument();
  });

  it("shows correct status based on GPS quality", () => {
    // Good status (> 85% quality)
    const { rerender, container } = render(<GPSQualityCard quality={90} />);
    expect(container.firstChild).toHaveClass("border-green-200");

    // Warning status (60-85% quality)
    rerender(<GPSQualityCard quality={75} />);
    expect(container.firstChild).toHaveClass("border-amber-200");

    // Error status (< 60% quality)
    rerender(<GPSQualityCard quality={45} />);
    expect(container.firstChild).toHaveClass("border-red-200");
  });
});