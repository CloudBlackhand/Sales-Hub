import { createRouteHandler } from "@openpanel/nextjs/server";

const apiUrl =
  process.env.OPENPANEL_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_OPENPANEL_API_URL?.trim();

export const { GET, POST } = createRouteHandler(apiUrl ? { apiUrl } : {});
