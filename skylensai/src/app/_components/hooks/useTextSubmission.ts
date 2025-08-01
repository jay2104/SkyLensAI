import { useState } from "react";
import { api } from "~/trpc/react";

export function useTextSubmission() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTextMutation = api.logFile.submitTextInput.useMutation();

  const submitText = async (text: string) => {
    try {
      setError(null);
      setSuccess(null);
      setIsSubmitting(true);

      const result = await submitTextMutation.mutateAsync({ text });
      
      setSuccess("Text submitted successfully!");
      return { success: true, logFile: result.logFile };
    } catch (err) {
      let errorMessage = "Submission failed";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle authentication errors specifically
        if (err.message.includes('UNAUTHORIZED') || err.message.includes('Unauthorized')) {
          errorMessage = "Please sign in to submit text. You will be redirected to the login page.";
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.href = '/auth/signin';
          }, 2000);
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitText,
    error,
    success,
    isSubmitting,
  };
}