import { ServerTimeResponseSchema } from "@/features/auctions/schema";

export async function GET(): Promise<Response> {
  const payload = {
    server_time: new Date().toISOString(),
  };
  return Response.json(ServerTimeResponseSchema.parse(payload));
}
