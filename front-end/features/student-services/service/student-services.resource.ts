import { createResource, defineQuery } from "@dangminhdev04032005/query-resource";
import { fetchBusTracking, fetchClubs, fetchMeals, fetchSurveys, fetchUniforms } from "./student-services.client";

export const studentServicesResource = createResource<void>()({
  namespace: ["clone-myltv"],
  name: "student-services",
  scopeKey: () => ["admin"],
  queries: {
    meals: defineQuery({ inputKey: (i?: void) => ["meals", i], queryFn: () => fetchMeals() }),
    bus: defineQuery({ inputKey: (i?: void) => ["bus", i], queryFn: () => fetchBusTracking() }),
    clubs: defineQuery({ inputKey: (i?: void) => ["clubs", i], queryFn: () => fetchClubs() }),
    surveys: defineQuery({ inputKey: (i?: void) => ["surveys", i], queryFn: () => fetchSurveys() }),
    uniforms: defineQuery({ inputKey: (i?: void) => ["uniforms", i], queryFn: () => fetchUniforms() }),
  },
  mutations: {},
});
