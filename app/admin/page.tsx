import { isAdminAuthenticated } from "@/libs/admin-auth";
import LoginForm from "@/components/admin/LoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  return authenticated ? <AdminDashboard /> : <LoginForm />;
}
