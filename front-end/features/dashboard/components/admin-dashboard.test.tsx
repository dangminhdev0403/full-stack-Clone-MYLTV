import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminDashboard } from "./admin-dashboard";
import { listStudents } from "@/features/students/service/students.client";
import { listUsers } from "@/features/users/service/users.client";

vi.mock("@/features/admin-shell", () => ({
  Icon: ({ name }: { name: string }) => <span aria-hidden="true">{name}</span>,
  AdminShell: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

vi.mock("@/features/students/service/students.client", () => ({ listStudents: vi.fn() }));
vi.mock("@/features/users/service/users.client", () => ({ listUsers: vi.fn() }));

const listStudentsMock = vi.mocked(listStudents);
const listUsersMock = vi.mocked(listUsers);

afterEach(() => vi.clearAllMocks());

describe("AdminDashboard", () => {
  it("renders real totals returned by the implemented users and students APIs", async () => {
    listUsersMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 7 });
    listStudentsMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 125, has_next: true });

    renderDashboard();

    expect(await screen.findByText("7")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
    expect(listUsersMock).toHaveBeenCalledWith("?page=1&page_size=1");
    expect(listStudentsMock).toHaveBeenCalledWith("?page=1&page_size=1");
    expect(screen.queryByText(/chuyên cần|học phí|xe buýt/i)).not.toBeInTheDocument();
  });

  it("keeps the students total available when the users request fails", async () => {
    listUsersMock.mockRejectedValue(new Error("users unavailable"));
    listStudentsMock.mockResolvedValue({ items: [], page: 1, page_size: 1, total: 125, has_next: false });

    renderDashboard();

    expect(await screen.findByText("125")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Không thể tải số người dùng");
    expect(screen.getByRole("button", { name: "Thử tải lại số người dùng" })).toBeInTheDocument();
  });
});

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>,
  );
}
