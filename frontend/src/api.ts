// Every call to your FastAPI backend goes through this file.
// If an endpoint changes on the backend, this is the only place to update.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ---- Types: these mirror the Pydantic schemas in app/schemas.py ----

export type Expense = {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string; // "2026-10-14": FastAPI sends dates as ISO strings
};

export type ExpenseCreate = Omit<Expense, "id">;

export type UserResponse = { id: number; name: string; email: string };

type Token = { access_token: string; token_type: string };

// ---- Errors ----

// Carries the HTTP status so the UI can react differently to
// 401 (log out), 409 (email taken), 422 (bad input), etc.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// FastAPI sends `detail` as a string for HTTPException,
// but as a list of objects for Pydantic validation errors (422).
function readDetail(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("detail" in body)) return null;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : "";
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join(". ");
  }
  return null;
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    // fetch only throws when it never got a response:
    // the backend is down, or the browser blocked it (CORS).
    throw new ApiError(0, `Can't reach the server at ${API_URL}. Check that uvicorn is running.`);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, readDetail(body) ?? `Request failed (${response.status})`);
  }
  return body as T;
}

// ---- Endpoints ----

export const api = {
  // POST /users/register: expects JSON, matches UserCreate
  register(name: string, email: string, password: string) {
    return request<UserResponse>("/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  },

  // POST /users/login: OAuth2PasswordRequestForm wants FORM data, not JSON,
  // and the email goes in a field called `username`.
  login(email: string, password: string) {
    return request<Token>("/users/login", {
      method: "POST",
      body: new URLSearchParams({ username: email, password }),
    });
  },

  // GET /expenses/: note the trailing slash. Your router prefix is
  // "/expenses" and the route is "/", so the real path is "/expenses/".
  // Without the slash FastAPI answers with a redirect.
  listExpenses(token: string) {
    return request<Expense[]>("/expenses/", { token });
  },

  createExpense(token: string, expense: ExpenseCreate) {
    return request<Expense>("/expenses/", {
      method: "POST",
      token,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });
  },

  // When you add the endpoints, the calls will look like this:
  //   updateExpense(token, id, data) -> PUT    /expenses/{id}
  //   deleteExpense(token, id)       -> DELETE /expenses/{id}
};
