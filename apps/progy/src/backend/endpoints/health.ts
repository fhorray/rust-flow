import type { ServerType } from "../types";


export const health: ServerType = async () => {
  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}