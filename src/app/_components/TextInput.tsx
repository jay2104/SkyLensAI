"use client";

import { useState } from "react";
import { useTextSubmission } from "./hooks/useTextSubmission";

interface TextInputProps {
  onTextSubmit: (text: string) => void;
}

const MAX_CHARACTERS = 2000;

export function TextInput({ onTextSubmit }: TextInputProps) {
  const [text, setText] = useState("");
  const { submitText, error, success, isSubmitting } = useTextSubmission();

  const remainingChars = MAX_CHARACTERS - text.length;
  const isOverLimit = remainingChars < 0;

  const handleSubmit = async () => {
    if (text.trim().length === 0) {
      return;
    }

    if (isOverLimit) {
      return;
    }

    const result = await submitText(text.trim());
    if (result.success) {
      onTextSubmit(text.trim());
      setText(""); // Clear the form after successful submission
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Text Area */}
      <div className="space-y-2">
        <label htmlFor="issue-description" className="block text-sm font-medium text-gray-700">
          Describe your issue
        </label>
        <textarea
          id="issue-description"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Please describe the issue you're experiencing with your drone or flight system. Include any error messages, symptoms, or relevant context that might help with analysis..."
          className={`w-full h-48 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isOverLimit ? "border-red-300" : "border-gray-300"
          }`}
        />
      </div>

      {/* Character Counter */}
      <div className="flex justify-between items-center text-sm">
        <div className={`${isOverLimit ? "text-red-600" : "text-gray-500"}`}>
          {text.length} / {MAX_CHARACTERS} characters
          {isOverLimit && (
            <span className="ml-2 font-medium">
              ({Math.abs(remainingChars)} over limit)
            </span>
          )}
        </div>
        <div className="text-gray-400 text-xs">
          Press Ctrl+Enter (or Cmd+Enter) to submit
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={text.trim().length === 0 || isOverLimit || isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting ? "Submitting..." : "Submit Description"}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Tips for better analysis:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Include specific error messages or codes</li>
          <li>Describe when the issue occurs (during flight, startup, etc.)</li>
          <li>Mention your drone model and software versions</li>
          <li>Note any recent changes to configuration or hardware</li>
        </ul>
      </div>
    </div>
  );
}