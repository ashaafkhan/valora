import { corsair } from "@/server/corsair";
import { toNextJsHandler } from "corsair";

export const { GET, POST } = toNextJsHandler(corsair, {
  basePath: "/api/corsair",
});
