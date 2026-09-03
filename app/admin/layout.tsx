import { isAdminAuthenticated } from "@/libs/admin-auth";
import LoginForm from "@/components/admin/LoginForm";
import AdminChrome from "@/components/admin/AdminChrome";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return <LoginForm />;

  return <AdminChrome>{children}</AdminChrome>;
}
