import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextInput } from "./TextInput";

// Mock the useTextSubmission hook
vi.mock("./hooks/useTextSubmission", () => ({
  useTextSubmission: () => ({
    submitText: vi.fn(),
    error: null,
    success: null,
    isSubmitting: false,
  }),
}));

describe("TextInput", () => {
  const mockOnTextSubmit = vi.fn();

  it("renders text area and submit button", () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} />);

    expect(screen.getByLabelText("Describe your issue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Description" })).toBeInTheDocument();
    expect(screen.getByText("0 / 2000 characters")).toBeInTheDocument();
  });

  it("displays help text with tips", () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} />);

    expect(screen.getAllByText("Tips for better analysis:")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Include specific error messages or codes")[0]).toBeInTheDocument();
  });
});