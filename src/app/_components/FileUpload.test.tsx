import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileUpload } from "./FileUpload";

// Mock the useFileUpload hook
vi.mock("./hooks/useFileUpload", () => ({
  useFileUpload: () => ({
    uploadFile: vi.fn(),
    uploadProgress: null,
    error: null,
    success: null,
    isUploading: false,
  }),
}));

describe("FileUpload", () => {
  const mockOnFileSelect = vi.fn();

  it("renders drag and drop area", () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    expect(screen.getByText("Drag and drop your log file here")).toBeInTheDocument();
    expect(screen.getByText("or click to browse files")).toBeInTheDocument();
    expect(screen.getByText("Choose File")).toBeInTheDocument();
  });

  it("shows supported file types and size limit", () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    expect(screen.getAllByText("Supported file types: .bin, .log, .tlog, .ulg")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Maximum file size: 100MB")[0]).toBeInTheDocument();
  });
});