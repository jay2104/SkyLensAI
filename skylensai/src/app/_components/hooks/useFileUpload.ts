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

      // Actually upload the file to Supabase
      setUploadProgress(40);
      
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        // Get detailed error information from Supabase
        const errorText = await uploadResponse.text();
        console.error('Upload failed details:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: Object.fromEntries(uploadResponse.headers.entries()),
          body: errorText
        });
        throw new Error(`Upload failed (${uploadResponse.status}): ${uploadResponse.statusText}. ${errorText}`);
      }

      setUploadProgress(80);

      // Confirm upload completion
      await confirmUploadMutation.mutateAsync({
        logFileId,
      });

      setUploadProgress(100);
      setSuccess(`Successfully uploaded: ${file.name}`);

      // Automatically redirect to analysis page after successful upload
      setTimeout(() => {
        window.location.href = `/dashboard/${logFileId}`;
      }, 1500);

      return { logFileId, success: true };
    } catch (err) {
      setUploadProgress(null);
      let errorMessage = "Upload failed";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle authentication errors specifically
        if (err.message.includes('UNAUTHORIZED') || err.message.includes('Unauthorized')) {
          errorMessage = "Please sign in to upload files. You will be redirected to the login page.";
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.href = '/auth/signin';
          }, 2000);
        }
      }
      
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