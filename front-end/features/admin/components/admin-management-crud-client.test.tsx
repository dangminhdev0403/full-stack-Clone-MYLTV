import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminManagementCrudClient } from "./admin-management-crud-client";
import * as adminManagementService from "../service/admin-management.service";
import type { AdminManagementSurface } from "../types/admin-management.types";

vi.mock("../service/admin-management.service", () => ({
  createAdminManagementRecord: vi.fn(),
  getAdminManagementCatalogItem: vi.fn(),
  getAdminManagementRecordDetail: vi.fn(),
  updateAdminManagementRecord: vi.fn(),
}));

const serviceMock = vi.mocked(adminManagementService);

function makeSurface(overrides: Partial<AdminManagementSurface> = {}): AdminManagementSurface {
  return {
    domain: "news",
    title: "Tin tức nhà trường",
    shortTitle: "Tin tức",
    href: "/admin/news",
    icon: "campaign",
    description: "Quản lý tin tức",
    androidEndpoints: [],
    backendDependency: "News backend",
    crudActions: ["create", "read", "update"],
    fields: [
      { key: "title", label: "Tiêu đề", type: "text", required: true, contractKey: "title" },
      { key: "summary", label: "Tóm tắt", type: "textarea", required: true, contractKey: "summary" },
      { key: "category", label: "Danh mục", type: "select", options: ["Tin tuc", "Thong bao"], contractKey: "category" },
      { key: "is_pinned", label: "Ghim tin", type: "boolean", contractKey: "is_pinned" },
    ],
    records: [
      {
        id: "news-1",
        title: "Backend headline",
        subtitle: "Backend summary",
        status: "Đang ghim",
        updatedAt: "09/07/2026",
        owner: "Truyền thông",
        metrics: ["Tin tuc"],
        raw: { id: "news-1", title: "Backend headline", summary: "Backend summary", category: "Tin tuc", is_pinned: true },
      },
    ],
    supports: { list: true, detail: true, create: true, update: true },
    source: "backend",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminManagementCrudClient", () => {
  it("disables create, update, and detail controls while backend is blocked", async () => {
    const user = userEvent.setup();
    render(
      <AdminManagementCrudClient
        initialSurface={makeSurface({
          source: "blocked",
          supports: { list: false, detail: false, create: false, update: false },
          error: "Prisma table missing",
        })}
      />,
    );

    expect(screen.getByRole("button", { name: /Tạo mới/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Chi tiết" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sửa" })).toBeDisabled();
    expect(screen.getByText("Prisma table missing")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Tạo mới/ }));
    expect(screen.queryByRole("form", { name: /tạo mới tin tức/i })).not.toBeInTheDocument();
    expect(serviceMock.getAdminManagementRecordDetail).not.toHaveBeenCalled();
    expect(serviceMock.updateAdminManagementRecord).not.toHaveBeenCalled();
  });

  it("opens the create dialog, validates required fields, and submits a normalized payload", async () => {
    const user = userEvent.setup();
    const refreshedSurface = makeSurface({ records: [] });
    serviceMock.createAdminManagementRecord.mockResolvedValue({ id: "news-2" });
    serviceMock.getAdminManagementCatalogItem.mockResolvedValue(refreshedSurface);

    render(<AdminManagementCrudClient initialSurface={makeSurface({ records: [] })} />);

    await user.click(screen.getAllByRole("button", { name: /Tạo mới/ })[0]);
    const form = screen.getByRole("form", { name: /tạo mới tin tức/i });

    await user.click(within(form).getByRole("button", { name: "Lưu" }));
    expect(await within(form).findByText("Vui lòng nhập tiêu đề.")).toBeInTheDocument();
    expect(serviceMock.createAdminManagementRecord).not.toHaveBeenCalled();

    await user.type(within(form).getByLabelText(/Tiêu đề/), "Tin backend mới");
    await user.type(within(form).getByLabelText(/Tóm tắt/), "Tóm tắt backend");
    await user.selectOptions(within(form).getByLabelText(/Danh mục/), "Tin tuc");
    await user.click(within(form).getByLabelText(/Ghim tin/));
    await user.click(within(form).getByRole("button", { name: "Lưu" }));

    await waitFor(() => {
      expect(serviceMock.createAdminManagementRecord).toHaveBeenCalledWith("news", {
        title: "Tin backend mới",
        summary: "Tóm tắt backend",
        category: "Tin tuc",
        is_pinned: true,
      });
    });
    expect(serviceMock.getAdminManagementCatalogItem).toHaveBeenCalledWith("news");
    expect(await screen.findByText("Đã tạo mới và làm mới danh sách.")).toBeInTheDocument();
  });

  it("opens detail and then update dialog for a backend record", async () => {
    const user = userEvent.setup();
    const updatedSurface = makeSurface({
      records: [{ ...makeSurface().records[0], title: "Backend headline updated", raw: { id: "news-1", title: "Backend headline updated", summary: "Backend summary", category: "Tin tuc" } }],
    });
    serviceMock.getAdminManagementRecordDetail.mockResolvedValue({ id: "news-1", title: "Backend headline", summary: "Backend detail body", category: "Tin tuc" });
    serviceMock.updateAdminManagementRecord.mockResolvedValue({ id: "news-1" });
    serviceMock.getAdminManagementCatalogItem.mockResolvedValue(updatedSurface);

    render(<AdminManagementCrudClient initialSurface={makeSurface()} />);

    await user.click(screen.getByRole("button", { name: "Chi tiết" }));
    expect(serviceMock.getAdminManagementRecordDetail).toHaveBeenCalledWith("news", "news-1");
    const detail = await screen.findByRole("complementary", { name: /chi tiết backend headline/i });
    expect(within(detail).getByText("Backend detail body")).toBeInTheDocument();

    await user.click(within(detail).getByRole("button", { name: /Sửa/ }));
    const form = screen.getByRole("form", { name: /sửa tin tức/i });
    const titleInput = within(form).getByLabelText(/Tiêu đề/);
    expect(titleInput).toHaveValue("Backend headline");

    await user.clear(titleInput);
    await user.type(titleInput, "Backend headline updated");
    await user.click(within(form).getByRole("button", { name: "Lưu" }));

    await waitFor(() => {
      expect(serviceMock.updateAdminManagementRecord).toHaveBeenCalledWith(
        "news",
        "news-1",
        expect.objectContaining({ title: "Backend headline updated", summary: "Backend summary", category: "Tin tuc", is_pinned: true }),
      );
    });
    expect(await screen.findByText("Đã cập nhật và làm mới danh sách.")).toBeInTheDocument();
  });

  it("surfaces detail failures without opening the update action when update is unsupported", async () => {
    const user = userEvent.setup();
    render(<AdminManagementCrudClient initialSurface={makeSurface({ supports: { list: true, detail: false, create: true, update: false }, error: "Detail endpoint disabled" })} />);

    await user.click(screen.getByRole("button", { name: /Xem chi tiết Backend headline/ }));

    const detail = await screen.findByRole("complementary", { name: /chi tiết backend headline/i });
    expect(within(detail).getByText(/Không tải được chi tiết backend: Detail endpoint disabled/)).toBeInTheDocument();
    expect(within(detail).queryByRole("button", { name: "Sửa" })).not.toBeInTheDocument();
    expect(serviceMock.getAdminManagementRecordDetail).not.toHaveBeenCalled();
  });
});
