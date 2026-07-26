import { PlannedSurface } from "@/features/planned/components/planned-surface";

export default function Page() {
  return (
    <PlannedSurface
      title="Dịch vụ học sinh"
      activeHref="/admin/services"
      description="Blocked: Meals, Surveys, Clubs, Bus và Uniforms mới có endpoint app/mobile; admin CRUD, DTO, authorization, audit và contract nghiệp vụ chưa được chốt. Events có màn quản trị riêng."
    />
  );
}
