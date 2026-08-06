import { afterEach, describe, expect, it, vi } from "vitest";
import { getStudentBusRoute } from "./student-transport.client";

afterEach(() => vi.unstubAllGlobals());

describe("student transport client", () => {
  it("uses protected admin BFF route", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { route_id: "route-1", route_name: "Tuyến 01", pickup_point: "Cổng trường", dropoff_point: "Nhà", pickup_time: "06:30", dropoff_time: "17:00", driver_name: "Tài xế UAT", driver_phone: null, bus_plate: "29B-UAT" } }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await getStudentBusRoute("student-1");
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/students/student-1/bus-route", { cache: "no-store" });
    expect(result.route_name).toBe("Tuyến 01");
  });
});