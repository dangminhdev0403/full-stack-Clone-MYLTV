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
    package: mealPackageSchema.optional(),
    menus: z.array(mealMenuSchema),
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
    tracking: z.object({
      latitude: z.number(),
      longitude: z.number(),
      speed_kph: z.number(),
      heading: z.number(),
      location_text: z.string(),
      recorded_at: z.string(),
      status: z.string(),
    }),
    stops: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        sequence: z.number(),
        estimated_at: z.string(),
        status: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      })
    ),
  })
);

export const clubSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  schedule: z.string(),
  fee: z.number(),
  status: z.string(),
  is_registered: z.boolean().optional(),
});

export const clubsResponseSchema = successSchema(
  z.object({
    clubs: z.array(clubSchema),
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
    surveys: z.array(surveySchema),
  })
);

export const uniformProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string().optional(),
  variants: z.array(
    z.object({
      sku: z.string(),
      size: z.string(),
      price: z.number(),
      stock_status: z.string(),
    })
  ),
});

export const uniformsResponseSchema = successSchema(
  z.object({
    products: z.array(uniformProductSchema),
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
  return (await parseApiResponse(response, clubsResponseSchema)).data;
}

export async function fetchSurveys() {
  const response = await fetch("/api/admin/services/surveys", { cache: "no-store" });
  return (await parseApiResponse(response, surveysResponseSchema)).data;
}

export async function fetchUniforms() {
  const response = await fetch("/api/admin/services/uniforms", { cache: "no-store" });
  return (await parseApiResponse(response, uniformsResponseSchema)).data;
}
