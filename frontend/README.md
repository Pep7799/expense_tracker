# Spent: expense tracker frontend

React + Vite + TypeScript frontend for your FastAPI backend in `../app`.
It uses your four endpoints as they are today: register, login, list expenses, create expense.

---

## Step by step: run it

### Step 1: Start the backend (terminal 1)

From the `expense_tracker` folder:

```bash
source venv/bin/activate
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs to check it's up.

### Step 2: Install the frontend (terminal 2, first time only)

```bash
cd frontend
npm install
```

This needs Node 18 or newer (`node -v` to check).

### Step 3: Start the frontend

```bash
npm run dev
```

Open **http://localhost:5173**. Use `localhost`, not `127.0.0.1`: your CORS list allows
`http://localhost:5173` exactly, and the browser treats the two as different origins.

The port is locked to 5173 (`strictPort` in `vite.config.ts`). If something else is using it,
Vite stops with an error instead of moving to 5174, where CORS would block every request.

### Step 4: Test it in this order

1. **Logged out:** you land on `/login`.
2. **Register:** click "Create an account". It calls `POST /users/register`, then logs you in straight away.
3. **Add expenses:** use the form. Each one is `POST /expenses/` with your token.
   The total, the category bar and the list all update.
4. **Reload the page:** the expenses come back from `GET /expenses/`, so they really are in the database.
5. **Second user:** log out and register a different email. You should see nothing.
   That proves your `user_id` filter works.
6. **Wrong password:** shows your backend's "Invalid email or password".
7. **Same email twice:** your 409 shows as "That email already has an account".
8. **Session expiry:** after 30 minutes the token expires and you're sent to login with a message.

---

## How it's built: read in this order

| File | What it does |
|---|---|
| `src/api.ts` | **Every** backend call lives here. Types mirror `app/schemas.py`. Start here. |
| `src/auth.tsx` | Keeps the token for the whole app (React context) and saves it in `localStorage`. Logs out when the token expires. |
| `src/App.tsx` | Routes: `/` (dashboard, logged-in only), `/login`, `/register`. |
| `src/pages/Login.tsx`, `Register.tsx` | The two auth forms. |
| `src/pages/Dashboard.tsx` | Loads expenses, owns the list state, handles 401s. |
| `src/components/SpendSummary.tsx` | The big total, the "This month / All time" switch and the category bar. |
| `src/components/AddExpenseForm.tsx` | The add form. |
| `src/components/Ledger.tsx` | The list, grouped by day. |
| `src/format.ts` | Money and date formatting. The currency is set at the top (NGN). |
| `src/styles.css` | All styling. Colours and fonts are variables at the top under `:root`. |

### Three things that connect to what you learned on the backend

**1. Login sends form data, not JSON.** `OAuth2PasswordRequestForm` expects
`application/x-www-form-urlencoded` with the email in a field called `username`.
See `api.login()`: it uses `URLSearchParams`, not `JSON.stringify`.

**2. The token goes in a header.** Every expense call sends `Authorization: Bearer <token>`.
That header is what `OAuth2PasswordBearer` in your `dependencies.py` reads, and it's why
`allow_headers=["*"]` was needed in your CORS setup.

**3. The trailing slash matters.** Your router has `prefix="/expenses"` and the route is `"/"`,
so the real path is `/expenses/`. Calling `/expenses` makes FastAPI answer with a redirect.

---

## Next: adding update and delete

### Backend (you)

- `PUT /expenses/{expense_id}`: find the expense by `id` **and** `user_id == current_user.id`, 404 if missing,
  set the new fields, commit, return it with `ExpenseResponse`.
- `DELETE /expenses/{expense_id}`: same lookup, `db.delete(expense)`, commit, return status `204`.

### Frontend (once those work in /docs)

1. In `src/api.ts`, add `updateExpense(token, id, data)` and `deleteExpense(token, id)`.
   There's a comment showing where. One catch: a `204` response has no body, and `request()` already copes with that.
2. In `src/pages/Dashboard.tsx`, add `updateExpense` and `deleteExpense` functions next to `createExpense`.
   They call the API, then update the `expenses` state with `map` (edit) or `filter` (delete).
3. In `src/components/Ledger.tsx`, put Edit and Delete buttons inside each `.ledger-row` and pass
   the two functions down as props.

---

## Changing things

- **Backend on another URL:** copy `.env.example` to `.env` and change `VITE_API_URL`.
- **Currency:** the two lines at the top of `src/format.ts`.
- **Colours:** the `--lilac`, `--black` etc. variables at the top of `src/styles.css`.
- **App name:** "Spent" appears in `index.html`, `AuthLayout.tsx` and `Dashboard.tsx`.
