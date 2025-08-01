"use client";

import { useRouter } from "next/navigation";
import { InputSelector } from "./InputSelector";
import { api } from "~/trpc/react";

export function InputSelectorWrapper() {
  const router = useRouter();
  const processLogFile = api.logFile.processLogFile.useMutation();

  const handleSubmit = async (data: { method: "file" | "text"; file?: File; text?: string }) => {
    console.log("Submitted data:", data);
    
    if (data.method === "file" && data.file) {
      // File upload is handled by the InputSelector itself via useFileUpload
      // Once uploaded, we get the logFileId and can redirect
      console.log("File upload initiated");
    } else if (data.method === "text" && data.text) {
      try {
        // Handle text submission
        const result = await api.logFile.submitTextInput.useMutation().mutateAsync({
          text: data.text,
        });
        
        if (result.success) {
          // Redirect to analysis page
          router.push(`/dashboard/${result.logFile.id}`);
        }
      } catch (error) {
        console.error("Text submission failed:", error);
      }
    }
  };

  return <InputSelector onSubmit={handleSubmit} />;
}