"use client";

import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { TextInput } from "./TextInput";

export type InputMethod = "file" | "text";

interface InputSelectorProps {
  onSubmit?: (data: { method: InputMethod; file?: File; text?: string }) => void;
}

export function InputSelector({ onSubmit }: InputSelectorProps) {
  const [activeMethod, setActiveMethod] = useState<InputMethod>("file");

  const handleFileSubmit = (file: File) => {
    onSubmit?.({ method: "file", file });
  };

  const handleTextSubmit = (text: string) => {
    onSubmit?.({ method: "text", text });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-gray-200" role="tablist">
        <button
          onClick={() => setActiveMethod("file")}
          role="tab"
          aria-selected={activeMethod === "file"}
          aria-controls="file-panel"
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeMethod === "file"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Upload Log File
        </button>
        <button
          onClick={() => setActiveMethod("text")}
          role="tab"
          aria-selected={activeMethod === "text"}
          aria-controls="text-panel"
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeMethod === "text"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Describe Issue
        </button>
      </div>

      {/* Input Content */}
      <div className="min-h-[300px]">
        {activeMethod === "file" && (
          <div id="file-panel" role="tabpanel" aria-labelledby="file-tab">
            <FileUpload onFileSelect={handleFileSubmit} />
          </div>
        )}
        {activeMethod === "text" && (
          <div id="text-panel" role="tabpanel" aria-labelledby="text-tab">
            <TextInput onTextSubmit={handleTextSubmit} />
          </div>
        )}
      </div>
    </div>
  );
}