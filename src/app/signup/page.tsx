import { SignupView } from "@/modules/auth/ui/views/signup-view";

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error } = await searchParams;
  return <SignupView error={error} />;
}