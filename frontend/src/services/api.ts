// frontend/src/services/api.ts
import ky from "ky";
import type { BeforeRequestHook, AfterResponseHook } from "ky";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const authHook: BeforeRequestHook = ({ request }) => {
  const token = localStorage.getItem("token");
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
};

const unauthorizedHook: AfterResponseHook = async ({ response }) => {
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
  return response;
};

export const api = ky.create({
  prefix: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    beforeRequest: [authHook],
    afterResponse: [unauthorizedHook],
  },
  retry: {
    limit: 2,
    methods: ["GET", "PUT", "DELETE", "HEAD", "OPTIONS"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  timeout: 30000,
});

export type { KyInstance } from "ky";
