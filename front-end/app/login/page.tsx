import { LoginPage } from "@/features/admin/components/login-page";

export default async function LoginRoute({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return <LoginPage callbackUrl={callbackUrl} />;
}
