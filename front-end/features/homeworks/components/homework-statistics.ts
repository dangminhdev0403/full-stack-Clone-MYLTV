type HomeworkStatInput = { deadline: string; status: string; subject: string };

export function summarizeHomeworks(items: HomeworkStatInput[], now = new Date()) {
  const completed = items.filter((item) => item.status === "submitted").length;
  const overdue = items.filter((item) => item.status !== "submitted" && new Date(item.deadline) < now).length;
  return { total: items.length, overdue, upcoming: items.length - completed - overdue, completed, subjects: new Set(items.map((item) => item.subject)).size };
}
