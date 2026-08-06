import { z } from "zod";
import { parseApiResponse, successSchema } from "@/lib/api/schemas";

export const mealMenuSchema = z.object({
  date: z.string(),
  day_label: z.string(),
  main_dish: z.string(),
  soup: z.string().nullable().optional(),
  side_dish: z.string().nullable().optional(),
  dessert: z.string().nullable().optional(),
  registration_status: z.string(),
});

export const mealPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  remaining_meals: z.number(),
  paid_amount: z.number(),
  expires_at: z.string(),
  status: z.string(),
});

export const mealsResponseSchema = successSchema(
  z.object({
    package: mealPackageSchema.nullable().optional(),
    menus: z.array(mealMenuSchema).default([]),
  })
);

export const busTrackingSchema = successSchema(
  z.object({
    route_id: z.string(),
    route_name: z.string(),
    vehicle_plate: z.string(),
    driver: z.object({
      name: z.string(),
      phone: z.string(),
    }),
    tracking: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
        speed_kph: z.number(),
        heading: z.number(),
        location_text: z.string(),
        recorded_at: z.string(),
        status: z.string(),
      })
      .optional(),
    stops: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          sequence: z.number(),
          estimated_at: z.string().optional(),
          pickup_time: z.string().optional(),
          status: z.string().optional().default("normal"),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
      )
      .default([]),
  })
);

export const clubSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional().default("Ngoại khóa"),
  schedule: z.string().optional().default("Hàng tuần"),
  schedule_text: z.string().optional(),
  fee: z.number().optional().default(0),
  status: z.string().optional().default("open"),
  registration_status: z.string().optional(),
  is_registered: z.boolean().optional(),
});

export const clubsResponseSchema = successSchema(
  z.object({
    items: z.array(clubSchema).optional(),
    clubs: z.array(clubSchema).optional(),
  })
);

export const surveySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  deadline: z.string(),
  status: z.string(),
});

export const surveysResponseSchema = successSchema(
  z.object({
    items: z.array(surveySchema).optional(),
    surveys: z.array(surveySchema).optional(),
  })
);

export const uniformProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string().nullable().optional(),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        size: z.string(),
        price: z.number(),
        stock_status: z.string(),
      })
    )
    .default([]),
});

export const uniformsResponseSchema = successSchema(
  z.object({
    products: z.array(uniformProductSchema).default([]),
    latest_order: z.any().nullable().optional(),
  })
);

export async function fetchMeals() {
  const response = await fetch("/api/admin/services/meals", { cache: "no-store" });
  return (await parseApiResponse(response, mealsResponseSchema)).data;
}

export async function fetchBusTracking() {
  const response = await fetch("/api/admin/services/bus", { cache: "no-store" });
  return (await parseApiResponse(response, busTrackingSchema)).data;
}

export async function fetchClubs() {
  const response = await fetch("/api/admin/services/clubs", { cache: "no-store" });
  const data = (await parseApiResponse(response, clubsResponseSchema)).data;
  const rawList = data.clubs ?? data.items ?? [];
  const list = rawList.map((c) => ({
    ...c,
    category: c.category || "Ngoại khóa",
    schedule: c.schedule || c.schedule_text || "Hàng tuần",
    status: c.status === "open" ? "Đang mở" : c.status || "Đang mở",
  }));
  return { clubs: list };
}

export async function fetchSurveys() {
  const response = await fetch("/api/admin/services/surveys", { cache: "no-store" });
  const data = (await parseApiResponse(response, surveysResponseSchema)).data;
  return { surveys: data.surveys ?? data.items ?? [] };
}

export async function fetchUniforms() {
  const response = await fetch("/api/admin/services/uniforms", { cache: "no-store" });
  return (await parseApiResponse(response, uniformsResponseSchema)).data;
}
