import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  withCredentials: true,
});

export const postSummary = (url: string, token?: string) =>
  api.post(
    "/summary",
    { url },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

export const getSummaries = (token?: string) =>
  api.get("/summaries", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });