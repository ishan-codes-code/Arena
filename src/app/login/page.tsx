import { LoginView } from "@/modules/auth/ui/views/login-view";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  return <LoginView error={error} />;
}
