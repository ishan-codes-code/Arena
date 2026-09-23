import { ResetPasswordView } from "@/modules/auth/ui/views/reset-password-view";

type ResetPasswordPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { email } = await searchParams;

  return <ResetPasswordView email={email ?? null} />;
}