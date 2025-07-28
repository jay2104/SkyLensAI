import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InputSelector } from "./InputSelector";

// Mock the hooks to avoid tRPC dependencies
vi.mock("./hooks/useFileUpload", () => ({
  useFileUpload: () => ({
    uploadFile: vi.fn(),
    uploadProgress: null,
    error: null,
    success: null,
    isUploading: false,
  }),
}));

vi.mock("./hooks/useTextSubmission", () => ({
  useTextSubmission: () => ({
    submitText: vi.fn(),
    error: null,
    success: null,
    isSubmitting: false,
  }),
}));

describe("InputSelector", () => {
  it("renders basic structure", () => {
    render(<InputSelector />);

    expect(screen.getByText("Upload Log File")).toBeInTheDocument();
    expect(screen.getByText("Describe Issue")).toBeInTheDocument();
  });
});