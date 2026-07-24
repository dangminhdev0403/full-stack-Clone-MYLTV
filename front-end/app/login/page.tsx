import type { Metadata } from "next";
import { LoginPage } from "@/features/admin/components/login-page";

export const metadata: Metadata = {
  title: "Đăng nhập | EduManager",
};

export default async function LoginRoute({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return <LoginPage callbackUrl={callbackUrl} />;
}
