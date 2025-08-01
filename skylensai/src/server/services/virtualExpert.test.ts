import { describe, it, expect, vi, beforeEach } from "vitest";
import { VirtualExpertService } from "./virtualExpert";

describe("VirtualExpertService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateResponse", () => {
    it("generates response for basic question without context", async () => {
      const params = {
        question: "How do I improve battery life?",
        context: null,
        userId: "test-user-id",
      };

      const response = await VirtualExpertService.generateResponse(params);

      expect(response).toMatchObject({
        response: expect.any(String),
        confidenceScore: expect.any(Number),
        methodology: expect.objectContaining({
          steps: expect.arrayContaining([expect.any(String)]),
          sources: expect.arrayContaining([expect.any(String)]),
          analysisType: expect.any(String),
          contextUsed: false,
        }),
        citations: expect.objectContaining({
          sources: expect.arrayContaining([expect.any(String)]),
          references: expect.arrayContaining([expect.any(String)]),
          disclaimers: expect.arrayContaining([expect.any(String)]),
        }),
      });

      expect(response.confidenceScore).toBeGreaterThan(0);
      expect(response.confidenceScore).toBeLessThanOrEqual(1);
    });

    it("generates contextual response when log data is provided", async () => {
      const params = {
        question: "Why did my battery drain quickly?",
        context: {
          fileName: "test-flight.log",
          fileType: "BIN",
          flightDuration: 600, // 10 minutes
          batteryData: {
            startVoltage: 12.6,
            endVoltage: 10.8,
          },
          gpsQuality: 95,
        },
        userId: "test-user-id",
      };

      const response = await VirtualExpertService.generateResponse(params);

      expect(response.methodology.contextUsed).toBe(true);
      expect(response.response).toContain("flight");
      expect(response.response).toContain("battery");
      
      // Should include contextual insights
      expect(response.response).toMatch(/Your flight showed.*%.*battery voltage drop/);
    });

    it("handles different question types appropriately", async () => {
      const diagnosticParams = {
        question: "What went wrong with my flight?",
        context: null,
        userId: "test-user-id",
      };

      const diagnosticResponse = await VirtualExpertService.generateResponse(diagnosticParams);
      expect(diagnosticResponse.response).toContain("diagnose");

      const educationalParams = {
        question: "What is GPS dilution of precision?",
        context: null,
        userId: "test-user-id",
      };

      const educationalResponse = await VirtualExpertService.generateResponse(educationalParams);
      expect(educationalResponse.response).toContain("explain");
    });

    it("calculates confidence scores appropriately", async () => {
      const basicParams = {
        question: "How do drones work?",
        context: null,
        userId: "test-user-id",
      };

      const basicResponse = await VirtualExpertService.generateResponse(basicParams);

      const contextualParams = {
        question: "How do drones work?",
        context: {
          fileName: "flight.log",
          fileType: "BIN",
          flightDuration: 300,
          batteryData: { startVoltage: 12.6, endVoltage: 11.8 },
        },
        userId: "test-user-id",
      };

      const contextualResponse = await VirtualExpertService.generateResponse(contextualParams);

      // Contextual responses should have higher confidence
      expect(contextualResponse.confidenceScore).toBeGreaterThan(basicResponse.confidenceScore);
    });

    it("includes safety disclaimers for advanced topics", async () => {
      const advancedParams = {
        question: "How do I tune PID parameters?",
        context: null,
        userId: "test-user-id",
      };

      const response = await VirtualExpertService.generateResponse(advancedParams);
      expect(response.response).toContain("Safety Note");
      expect(response.response).toContain("tested carefully");
    });

    it("handles null values in context gracefully", async () => {
      const params = {
        question: "How is my battery performance?",
        context: {
          fileName: "test.log",
          fileType: "BIN",
          flightDuration: null,
          batteryData: {
            startVoltage: null,
            endVoltage: null,
          },
          gpsQuality: null,
        },
        userId: "test-user-id",
      };

      const response = await VirtualExpertService.generateResponse(params);
      
      // Should not crash and should still provide a meaningful response
      expect(response.response).toBeTruthy();
      expect(response.confidenceScore).toBeGreaterThan(0);
    });

    it("provides appropriate citations and sources", async () => {
      const params = {
        question: "What are the best practices for drone maintenance?",
        context: null,
        userId: "test-user-id",
      };

      const response = await VirtualExpertService.generateResponse(params);

      expect(response.citations.sources).toContain("ArduPilot Development Team Documentation");
      expect(response.citations.sources).toContain("PX4 Autopilot User Guide");
      expect(response.citations.disclaimers).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/qualified personnel/)
        ])
      );
    });

    it("categorizes questions by domain correctly", async () => {
      const batteryQuestion = {
        question: "My battery voltage is dropping too fast",
        context: null,
        userId: "test-user-id",
      };

      const gpsQuestion = {
        question: "GPS signal keeps cutting out",
        context: null,
        userId: "test-user-id",
      };

      const batteryResponse = await VirtualExpertService.generateResponse(batteryQuestion);
      const gpsResponse = await VirtualExpertService.generateResponse(gpsQuestion);

      // Responses should be tailored to the specific domain
      expect(batteryResponse.response.toLowerCase()).toContain("battery");
      expect(gpsResponse.response.toLowerCase()).toContain("gps");
    });

    it("handles edge cases gracefully", async () => {
      // Test with minimal valid input
      const response = await VirtualExpertService.generateResponse({
        question: "Test",
        context: null,
        userId: "test",
      });
      
      expect(response).toBeDefined();
      expect(response.response).toBeTruthy();
      expect(response.confidenceScore).toBeGreaterThan(0);
    });
  });

  describe("Private Methods Integration", () => {
    it("analyzes question domains correctly", () => {
      // Since these are private methods, we test them indirectly through the public API
      const questions = [
        "battery voltage issues",
        "GPS navigation problems", 
        "flight mode configuration",
        "motor vibration analysis",
      ];

      questions.forEach(async (question) => {
        const response = await VirtualExpertService.generateResponse({
          question,
          context: null,
          userId: "test-user",
        });
        
        expect(response.methodology.analysisType).toMatch(/_(diagnostic|educational|troubleshooting|optimization)$/);
      });
    });

    it("generates methodology that matches response content", async () => {
      const params = {
        question: "How can I optimize my flight performance?",
        context: {
          fileName: "performance-test.bin",
          fileType: "BIN",
          flightDuration: 1200,
        },
        userId: "test-user",
      };

      const response = await VirtualExpertService.generateResponse(params);

      expect(response.methodology.contextUsed).toBe(true);
      expect(response.methodology.steps).toContain("Context integration from user's flight data");
      expect(response.citations.references).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/performance-test.bin/)
        ])
      );
    });
  });
});