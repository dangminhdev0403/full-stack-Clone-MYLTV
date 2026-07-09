import { AdminManagementRecordDetailPage } from "@/features/admin/components/admin-management-page";

export default async function AdminManagementRecordDetailRoute({
  params,
}: {
  params: Promise<{ domain: string; id: string }>;
}) {
  const { domain, id } = await params;

  return <AdminManagementRecordDetailPage domain={domain} id={decodeURIComponent(id)} />;
}
