import { describe, it, expect } from "vitest";
import { ChartRenderer } from "./chartRenderer";
import fs from "fs";

describe("ChartRenderer", () => {
  const sampleData = [
    { timestamp: 0, value: 0, unit: "meters" },
    { timestamp: 5, value: 10, unit: "meters" },
    { timestamp: 10, value: 25, unit: "meters" },
    { timestamp: 15, value: 40, unit: "meters" },
    { timestamp: 20, value: 35, unit: "meters" },
    { timestamp: 25, value: 20, unit: "meters" },
    { timestamp: 30, value: 5, unit: "meters" },
  ];

  describe("generatePngChart", () => {
    it("should generate a PNG chart buffer", async () => {
      const buffer = await ChartRenderer.generatePngChart({
        title: "Test Altitude Chart",
        data: sampleData,
        parameter: "altitude",
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // Check PNG file signature
      expect(buffer[0]).toBe(0x89);
      expect(buffer[1]).toBe(0x50);
      expect(buffer[2]).toBe(0x4E);
      expect(buffer[3]).toBe(0x47);
    });

    it("should generate chart with custom dimensions", async () => {
      const buffer = await ChartRenderer.generatePngChart({
        title: "Test Chart",
        data: sampleData,
        parameter: "altitude", 
        width: 1200,
        height: 800,
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle different parameter types", async () => {
      const batteryData = [
        { timestamp: 0, value: 16.8, unit: "volts" },
        { timestamp: 60, value: 16.2, unit: "volts" },
        { timestamp: 120, value: 15.8, unit: "volts" },
        { timestamp: 180, value: 15.2, unit: "volts" },
      ];

      const buffer = await ChartRenderer.generatePngChart({
        title: "Battery Voltage",
        data: batteryData,
        parameter: "battery_voltage",
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should save PNG file for manual verification (optional)", async () => {
      const buffer = await ChartRenderer.generatePngChart({
        title: "Test Flight Altitude",
        data: sampleData,
        parameter: "altitude",
      });

      // Save to temp file for manual verification (optional)
      const tempFile = "/tmp/test-chart.png";
      fs.writeFileSync(tempFile, buffer);
      
      expect(fs.existsSync(tempFile)).toBe(true);
      
      console.log(`Test chart saved to: ${tempFile}`);
      
      // Clean up
      fs.unlinkSync(tempFile);
    });
  });

  describe("generateMultiParameterPngChart", () => {
    it("should generate multi-parameter chart", async () => {
      const altitudeData = sampleData;
      const batteryData = [
        { timestamp: 0, value: 16.8, unit: "volts" },
        { timestamp: 10, value: 16.4, unit: "volts" },
        { timestamp: 20, value: 16.0, unit: "volts" },
        { timestamp: 30, value: 15.6, unit: "volts" },
      ];

      const buffer = await ChartRenderer.generateMultiParameterPngChart(
        "Multi-Parameter Flight Data",
        [
          { parameter: "altitude", data: altitudeData },
          { parameter: "battery_voltage", data: batteryData },
        ]
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      
      // Check PNG file signature
      expect(buffer[0]).toBe(0x89);
      expect(buffer[1]).toBe(0x50);
      expect(buffer[2]).toBe(0x4E);
      expect(buffer[3]).toBe(0x47);
    });

    it("should handle datasets with different timestamps", async () => {
      const dataset1 = [
        { timestamp: 0, value: 10, unit: "meters" },
        { timestamp: 5, value: 20, unit: "meters" },
        { timestamp: 10, value: 15, unit: "meters" },
      ];

      const dataset2 = [
        { timestamp: 2, value: 16.8, unit: "volts" },
        { timestamp: 7, value: 16.4, unit: "volts" },
        { timestamp: 12, value: 16.0, unit: "volts" },
      ];

      const buffer = await ChartRenderer.generateMultiParameterPngChart(
        "Misaligned Timestamps Test",
        [
          { parameter: "altitude", data: dataset1 },
          { parameter: "battery_voltage", data: dataset2 },
        ]
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should save multi-parameter PNG file for manual verification (optional)", async () => {
      const altitudeData = sampleData;
      const batteryData = [
        { timestamp: 0, value: 16.8, unit: "volts" },
        { timestamp: 10, value: 16.4, unit: "volts" },
        { timestamp: 20, value: 16.0, unit: "volts" },
        { timestamp: 30, value: 15.6, unit: "volts" },
      ];

      const buffer = await ChartRenderer.generateMultiParameterPngChart(
        "Test Multi-Parameter Chart",
        [
          { parameter: "altitude", data: altitudeData },
          { parameter: "battery_voltage", data: batteryData },
        ]
      );

      // Save to temp file for manual verification (optional)
      const tempFile = "/tmp/test-multi-chart.png";
      fs.writeFileSync(tempFile, buffer);
      
      expect(fs.existsSync(tempFile)).toBe(true);
      
      console.log(`Multi-parameter test chart saved to: ${tempFile}`);
      
      // Clean up
      fs.unlinkSync(tempFile);
    });
  });

  describe("error handling", () => {
    it("should handle empty data arrays", async () => {
      await expect(
        ChartRenderer.generatePngChart({
          title: "Empty Data Test",
          data: [],
          parameter: "altitude",
        })
      ).rejects.toThrow();
    });

    it("should handle invalid parameters gracefully", async () => {
      const buffer = await ChartRenderer.generatePngChart({
        title: "Unknown Parameter Test",
        data: sampleData,
        parameter: "unknown_param",
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});