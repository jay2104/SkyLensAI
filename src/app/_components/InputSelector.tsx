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
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveMethod("file")}
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
          <FileUpload onFileSelect={handleFileSubmit} />
        )}
        {activeMethod === "text" && (
          <TextInput onTextSubmit={handleTextSubmit} />
        )}
      </div>
    </div>
  );
}