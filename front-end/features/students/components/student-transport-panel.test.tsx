import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudentBusRoute } from "../service/student-transport.client";
import { StudentTransportPanel } from "./student-transport-panel";

vi.mock("../service/student-transport.client", () => ({ getStudentBusRoute: vi.fn() }));
afterEach(() => vi.clearAllMocks());

describe("StudentTransportPanel", () => {
  it("renders assigned route", async () => {
    vi.mocked(getStudentBusRoute).mockResolvedValue({ route_id: "route-1", route_name: "Tuyến 01", pickup_point: "Cổng trường", dropoff_point: "Nhà", pickup_time: "06:30", dropoff_time: "17:00", driver_name: "Tài xế UAT", driver_phone: null, bus_plate: "29B-UAT" });
    renderPanel(true);
    expect(await screen.findByText("Tuyến 01")).toBeInTheDocument();
    expect(screen.getByText("29B-UAT")).toBeInTheDocument();
  });

  it("does not fetch without permission", async () => {
    renderPanel(false);
    expect(await screen.findByText("Bạn không có quyền xem thông tin xe tuyến của học sinh này.")).toBeInTheDocument();
    expect(getStudentBusRoute).not.toHaveBeenCalled();
  });
});

function renderPanel(canRead: boolean) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><StudentTransportPanel studentId="student-1" canRead={canRead} /></QueryClientProvider>);
}