"use client";

import { useState, useCallback } from "react";
import { useFileUpload } from "./hooks/useFileUpload";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const ACCEPTED_FILE_TYPES = [".bin", ".log", ".tlog", ".ulg"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { uploadFile, uploadProgress, error, success, isUploading } = useFileUpload();

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 100MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
      return `File type not supported. Please upload: ${ACCEPTED_FILE_TYPES.join(", ")}`;
    }

    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      return;
    }

    const result = await uploadFile(file);
    if (result.success) {
      onFileSelect(file);
    }
  }, [uploadFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]!);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]!);
    }
  }, [handleFileSelect]);

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <div className="space-y-4">
          <div className="text-6xl text-gray-400">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drag and drop your log file here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse files
            </p>
          </div>
          <input
            type="file"
            accept={ACCEPTED_FILE_TYPES.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Choose File
          </label>
        </div>
      </div>

      {/* File Type Info */}
      <div className="text-sm text-gray-600">
        <p>Supported file types: {ACCEPTED_FILE_TYPES.join(", ")}</p>
        <p>Maximum file size: 100MB</p>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

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
    </div>
  );
}