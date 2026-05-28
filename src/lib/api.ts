const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("cp_token");
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("cp_token");
      localStorage.removeItem("cp_user");
      window.location.reload();
    }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; companyName: string }) =>
      request<{ token: string; user: { id: string; email: string; tenantId: string } }>(
        "POST", "/auth/register", data
      ),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: { id: string; email: string; tenantId: string } }>(
        "POST", "/auth/login", data
      ),
  },
  projects: {
    list: () => request<any[]>("GET", "/projects"),
    create: (data: unknown) => request<any>("POST", "/projects", data),
    update: (id: string, data: unknown) => request<any>("PATCH", `/projects/${id}`, data),
    delete: (id: string) => request<any>("DELETE", `/projects/${id}`),
  },
  tasks: {
    list: () => request<any[]>("GET", "/tasks"),
    create: (data: unknown) => request<any>("POST", "/tasks", data),
    update: (id: string, data: unknown) => request<any>("PATCH", `/tasks/${id}`, data),
    delete: (id: string) => request<any>("DELETE", `/tasks/${id}`),
  },
  documents: {
    list: () => request<any[]>("GET", "/documents"),
    create: (data: unknown) => request<any>("POST", "/documents", data),
    update: (id: string, data: unknown) => request<any>("PATCH", `/documents/${id}`, data),
    delete: (id: string) => request<any>("DELETE", `/documents/${id}`),
    upload: async (formData: FormData) => {
      const token = localStorage.getItem("cp_token");
      const res = await fetch(`${BASE}/documents/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Upload failed");
      }
      return res.json();
    },
  },
  team: {
    list: () => request<any[]>("GET", "/team"),
    create: (data: unknown) => request<any>("POST", "/team", data),
  },
  proposals: {
    list: () => request<any[]>("GET", "/proposals"),
    create: (data: unknown) => request<any>("POST", "/proposals", data),
  },
  invoices: {
    list: () => request<any[]>("GET", "/invoices"),
    create: (data: unknown) => request<any>("POST", "/invoices", data),
    update: (id: string, data: unknown) => request<any>("PATCH", `/invoices/${id}`, data),
  },
  changeOrders: {
    list: () => request<any[]>("GET", "/change-orders"),
    create: (data: unknown) => request<any>("POST", "/change-orders", data),
    update: (id: string, data: unknown) => request<any>("PATCH", `/change-orders/${id}`, data),
  },
  budgets: {
    list: () => request<any[]>("GET", "/budgets"),
    create: (data: unknown) => request<any>("POST", "/budgets", data),
    update: (id: string, data: unknown) => request<any>("PATCH", `/budgets/${id}`, data),
  },
  timeRecords: {
    list: () => request<any[]>("GET", "/time-records"),
    create: (data: unknown) => request<any>("POST", "/time-records", data),
    delete: (id: string) => request<any>("DELETE", `/time-records/${id}`),
  },
};
