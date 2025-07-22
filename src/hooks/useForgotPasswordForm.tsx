import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { pb } from '../lib/pocketbase';
import { toast } from "sonner";

export function useForgotPasswordForm() {
  const navigate = useNavigate();

  return useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await pb.collection('users').requestPasswordReset(value.email);
        toast(
          "Password Reset Email Sent",
          {
            description: "If an account with that email exists, you will receive a password reset link.",
          }
        );
        navigate({ to: '/login' });
      } catch (error: any) {
        console.error("Password reset failed:", error);
        toast(
          "Password Reset Failed",
          {
            description: error.message || "An unexpected error occurred.",
          }
        );
      }
    },
  });
}