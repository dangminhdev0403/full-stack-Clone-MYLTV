import { StudentDetailPage } from "@/features/students/components/student-detail-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <StudentDetailPage id={(await params).id} />; }
