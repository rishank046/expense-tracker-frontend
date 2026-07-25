# 💰 Expense Tracker SaaS — Modern Frontend

A high-performance, production-ready SaaS frontend built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **React Router v7**, **Axios**, and **Recharts** for personal finance tracking, budget goal management, date-range SQL aggregations, and visual expense analytics.

Designed with modern aesthetic principles inspired by **Linear**, **Vercel**, **Supabase**, and **Stripe Dashboard**, this application features dark mode support, glassmorphism accents, responsive drawers, skeleton loaders, custom toast notifications, and route-based code splitting.

---

## 📌 Features & Application Workflow

- **🔐 Authentication & Session Management**:
  - Secure user registration (`POST /user/signin`).
  - Session login (`POST /user/login`) with automatic Bearer token storage in `localStorage` and `cookie-parser` fallback.
  - Demo login helper for quick local evaluation.
  - Complete logout session teardown.

- **📊 Executive Dashboard (`/`)**:
  - KPI metric cards: Total Expense, Monthly Income baseline, Remaining Budget, and Goal Progress.
  - Spending Trend (Recharts Area Chart) and Category Distribution (Recharts Donut Chart).
  - Quick date-range filters (7 Days, 30 Days, YTD, All Time).
  - Recent transactions table preview with one-click Add Expense modal.

- **💸 Expense Operations & Management (`/expenses`)**:
  - History view (`GET /expense/getExpense`) with category badge mapping.
  - Interactive Add & Edit modal (`POST /expense/addExpense` & `PUT /expense/updateExpense`).
  - Action verification modal for deletions (`POST /expense/deleteExpense`).
  - Amount Ceiling Filter query (`GET /expense/filterAmount`) utilizing MySQL composite indexes.
  - Client-side text search, category filtering, column sorting, and pagination.
  - **CSV Export**: One-click export for accounting and reporting.

- **📈 Financial Analytics & Aggregations (`/analytics`)**:
  - Date-range aggregation queries (`GET /expense/getSummary`) returning server-side `SUM`, `MIN`, and `MAX` values.
  - Spend stats: Average expense per transaction, minimum/maximum transaction benchmarks.
  - Category breakdown bar charts and threshold ceiling filters.

- **🎯 Budgets & Financial Goals (`/budgets`)**:
  - Financial target setup (`POST /user/profile`): Monthly Salary, Minimum Required Expense, and Goal Limit.
  - Visual budget health indicator (On Track vs. Exceeded Goal).
  - Projected monthly net savings capacity and savings rate calculation.

- **👤 User Profile & Settings (`/profile`)**:
  - Account information and active session status.
  - Real-time backend API diagnostic check (MySQL connection pool ping).
  - Dark/Light mode theme switcher.

---

## 🧠 Architecture & How It Works

```
src/
├── api/
│   └── axios.js            # Axios client with request/response interceptors & error handler
├── components/
│   ├── common/             # Reusable UI primitives (Modal, ConfirmDialog, Badge, Skeleton, EmptyState)
│   ├── expense/            # Expense form modals & filters
│   └── layout/             # Responsive Sidebar, Navbar, and AppLayout
├── constants/
│   └── categories.js       # Category mapping, Lucide icons, and theme color tokens
├── context/
│   ├── AuthContext.jsx     # User state, token persistence, login/register/profile methods
│   ├── ThemeContext.jsx    # Dark/Light mode toggle with localStorage & system preference sync
│   └── ToastContext.jsx    # Global toast notification container
├── pages/
│   ├── Analytics.jsx       # SQL date-range aggregations & statistical insights
│   ├── Budgets.jsx         # Budget targets configuration & health tracker
│   ├── Dashboard.jsx       # Overview, Recharts visualizations, and recent logs
│   ├── Expenses.jsx        # Data management table with search, filter, edit, delete, & CSV export
│   ├── Login.jsx           # Sign in view
│   ├── Profile.jsx         # User preferences and backend health diagnostics
│   ├── Register.jsx        # Account registration view
│   └── NotFound.jsx       # 404 error page
├── routes/
│   └── AppRoutes.jsx       # Protected and Guest route wrappers with React.lazy code-splitting
├── App.jsx                 # Provider hierarchy setup
├── main.jsx                # Application root entry point
└── index.css               # Tailwind CSS v4 imports, CSS variables, and glassmorphism styles
```

### Authentication & API Request Flow
1. When a user logs in via `POST /user/login`, the API returns a authentication token and sets an HTTP cookie.
2. The frontend stores the token in `localStorage` and updates `AuthContext`.
3. The `axios.js` request interceptor automatically attaches `Authorization: Bearer <token>` to every subsequent HTTP request.
4. Response interceptors catch error codes (`Unauthorized`, `No_Session_Id_Found`, `Missing_Required_Fields`) and format them into readable toast notifications.

---

## 🛠️ Prerequisites & Requirements

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Backend API**: The `expense-tracker-api` server running locally on `http://localhost:3000` (or deployed on cloud).

---

## 🚀 How to Run Locally

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/rishank046/expense-tracker-frontend.git
cd expense-tracker-frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Start the Development Server
```bash
npm run dev
# or
npm start
```
The application will start with Vite HMR on `http://localhost:5173`.

### 4. Build for Production
To generate an optimized production bundle:
```bash
npm run build
```
Output files will be generated inside the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## ⚡ Performance Optimizations & Benchmarks

- **Route-Based Lazy Loading**: All pages use `React.lazy()` and `Suspense`, splitting bundle chunks so users load only the JavaScript required for their active page.
- **Tailwind CSS v4 Engine**: Utilizes the `@tailwindcss/vite` plugin for fast builds (~8.8 kB gzipped CSS file size).
- **Cumulative Layout Shift (CLS) Prevention**: Integrated pulse skeletons (`CardSkeleton`, `TableRowSkeleton`) maintain layout dimensions during API loading states.
- **Client-Side Memoization**: High-frequency calculations (category totals, chart formatting, pagination slices) are memoized using `useMemo`.

---

## 🔑 API Endpoints Reference

| Endpoint | Method | Component / Page | Description |
| :--- | :---: | :--- | :--- |
| `/user/signin` | `POST` | `Register.jsx` | Registers a new user account |
| `/user/login` | `POST` | `Login.jsx` | Authenticates user and issues session token |
| `/user/profile` | `POST` | `Budgets.jsx` | Updates salary, minimum expense, and expense goal |
| `/expense/getExpense` | `GET` | `Dashboard.jsx`, `Expenses.jsx` | Fetches complete user expense history |
| `/expense/addExpense` | `POST` | `ExpenseModal.jsx` | Creates a new expense entry |
| `/expense/updateExpense` | `PUT` | `ExpenseModal.jsx`, `Expenses.jsx` | Updates expense amount, description, or category |
| `/expense/deleteExpense` | `POST` | `Expenses.jsx`, `ConfirmDialog.jsx` | Deletes an expense entry by ID |
| `/expense/getSummary` | `GET` | `Dashboard.jsx`, `Analytics.jsx` | Executes SQL `SUM`, `MIN`, `MAX` range aggregation |
| `/expense/filterAmount` | `GET` | `Expenses.jsx`, `Analytics.jsx` | Filters expenses below specified amount threshold |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
