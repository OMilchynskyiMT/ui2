import { createAxiosTransport, createHttpClient } from "@/lib/http";

export const http = createHttpClient({
  transport: createAxiosTransport(),
  baseUrl: import.meta.env.VITE_API_URL,
  timeout: 2 * 60 * 1000,
})
