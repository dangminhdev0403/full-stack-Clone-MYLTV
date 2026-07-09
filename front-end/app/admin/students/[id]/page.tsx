import { AdminManagementRecordDetailPage } from "@/features/admin/components/admin-management-page";

export default async function StudentDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminManagementRecordDetailPage domain="students" id={decodeURIComponent(id)} />;
}
