import { createRouteHandler } from "@openpanel/nextjs/server";

const DEFAULT_UPSTREAM = "https://api.openpanel.dev";

const upstream =
  process.env.OPENPANEL_PROXY_UPSTREAM_URL?.replace(/\/$/, "") || DEFAULT_UPSTREAM;

const handler = createRouteHandler({ apiUrl: upstream });

export const GET = handler;
export const POST = handler;
