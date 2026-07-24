import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./login-page";

const { replace, refresh, signIn } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signIn: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("next-auth/react", () => ({ signIn }));

describe("LoginPage", () => {
  beforeEach(() => {
    replace.mockReset();
    refresh.mockReset();
    signIn.mockReset();
  });

  it("reveals and hides the password with an accessible control", () => {
    render(<LoginPage />);
    const password = screen.getByLabelText("Mật khẩu");
    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ẩn mật khẩu" })).toBeInTheDocument();
  });

  it("renders the approved Stitch login content without unsupported account helpers", () => {
    render(<LoginPage />);

    expect(screen.getByRole("img", { name: "Không gian học tập hiện đại của EduManager" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Đăng nhập hệ thống quản trị" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tên đăng nhập")).toHaveAttribute("placeholder", "Nhập tên đăng nhập");
    expect(screen.queryByText("Ghi nhớ đăng nhập")).not.toBeInTheDocument();
    expect(screen.queryByText("Quên mật khẩu?")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("exposes an accessible busy state while credentials are being checked", async () => {
    signIn.mockReturnValue(new Promise(() => undefined));
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Tên đăng nhập"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByRole("button", { name: "Đang đăng nhập..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Đang đăng nhập..." })).toHaveAttribute("aria-busy", "true");
  });

  it("preserves the safe callback and secure credentials sign-in flow", async () => {
    signIn.mockResolvedValue({ ok: true });
    render(<LoginPage callbackUrl="/admin/news?status=draft" />);
    fireEvent.change(screen.getByLabelText("Tên đăng nhập"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => expect(signIn).toHaveBeenCalledWith("credentials", {
      redirect: false,
      username: "admin",
      password: "secret",
      callbackUrl: "/admin/news?status=draft",
    }));
    expect(replace).toHaveBeenCalledWith("/admin/news?status=draft");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("shows an inline error and restores the submit action after rejected credentials", async () => {
    signIn.mockResolvedValue({ error: "CredentialsSignin" });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Tên đăng nhập"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Đăng nhập thất bại");
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
  });
});
