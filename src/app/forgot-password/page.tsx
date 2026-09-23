import { ForgotPasswordView } from "@/modules/auth/ui/views/forgot-password-view";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error } = await searchParams;
  return <ForgotPasswordView error={error} />;
}