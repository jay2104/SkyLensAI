import { useState } from "react";
import { LogFileType } from "@prisma/client";
import { api } from "~/trpc/react";

export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getPresignedUrlMutation = api.logFile.getPresignedUploadUrl.useMutation();
  const confirmUploadMutation = api.logFile.confirmUpload.useMutation();

  const uploadFile = async (file: File) => {
    try {
      setError(null);
      setSuccess(null);
      setUploadProgress(0);

      // Determine file type from extension with better validation
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension) {
        throw new Error("File must have a valid extension");
      }
      
      let fileType: LogFileType;
      
      switch (fileExtension) {
        case 'bin':
          fileType = LogFileType.BIN;
          break;
        case 'log':
          fileType = LogFileType.LOG;
          break;
        case 'tlog':
          fileType = LogFileType.TLOG;
          break;
        case 'ulg':
          fileType = LogFileType.ULG;
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      // Get presigned upload URL
      setUploadProgress(20);
      const { logFileId, presignedUrl } = await getPresignedUrlMutation.mutateAsync({
        fileName: file.name,
        fileType,
        fileSize: file.size,
      });

      // Simulate file upload progress (replace with actual upload to Supabase later)
      setUploadProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Confirm upload completion
      await confirmUploadMutation.mutateAsync({
        logFileId,
      });

      setUploadProgress(100);
      setSuccess(`Successfully uploaded: ${file.name}`);

      return { logFileId, success: true };
    } catch (err) {
      setUploadProgress(null);
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    uploadFile,
    uploadProgress,
    error,
    success,
    isUploading: uploadProgress !== null && uploadProgress < 100,
  };
}