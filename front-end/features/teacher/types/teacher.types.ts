export type TeacherLoadState = "Quá tải" | "Ổn định" | "Cần hỗ trợ";

export type TeacherCapacityItem = {
  label: string;
  owner: string;
  load: number;
  state: TeacherLoadState;
};
