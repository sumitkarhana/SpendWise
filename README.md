# SpendWise — Full-Stack Expense Tracker

A MERN app for recording income and expenses, viewing dashboard totals and charts, and tracking monthly category budgets.

## Features
- Register, log in and log out (bcrypt hashing, JWT in an HTTP-only cookie)
- Private, per-user transactions (every query is scoped to the logged-in user)
- Add, edit, delete transactions with validation on client and server
- Dashboard: total income, expenses, balance (computed in MongoDB), recent transactions
- Charts: expense breakdown by category (pie) and monthly income vs expenses (bar)
- Filters: search, type, category, date range
- Monthly budgets per expense category with progress bars and over-budget warnings
- Responsive layout, INR formatting, loading, empty and error states

## Tech stack
React (Vite), React Router, Recharts, Node.js, Express, MongoDB, Mongoose

## Local setup
Requires Node.js 18+ and a MongoDB Atlas or local MongoDB database.

```bash
# backend
cd server
cp .env.example .env     # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5000

# frontend (new terminal)
cd client
cp .env.example .env.local
npm install
npm run dev              # http://localhost:5173
```

Generate a JWT secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Environment variables
| File | Variable | Purpose |
|---|---|---|
| server/.env | PORT | API port (default 5000) |
| server/.env | MONGODB_URI | MongoDB connection string |
| server/.env | JWT_SECRET | Secret for signing login tokens |
| server/.env | CLIENT_URL | Allowed frontend origin(s), comma separated |
| server/.env | NODE_ENV | Set to `production` when deployed (enables secure cross-site cookies) |
| client/.env.local | VITE_API_URL | Backend API base URL, e.g. http://localhost:5000/api |

## API
All routes except register, login and health require the login cookie. State-changing requests must send the header `X-Requested-With: SpendWise` (the frontend does this).

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Log in |
| POST | /api/auth/logout | Log out |
| GET | /api/auth/me | Current user |
| GET | /api/transactions | List (query: type, category, startDate, endDate, search, limit) |
| GET | /api/transactions/:id | One transaction |
| POST | /api/transactions | Create |
| PUT | /api/transactions/:id | Update |
| DELETE | /api/transactions/:id | Delete |
| GET | /api/transactions/summary | Totals (optional startDate, endDate) |
| GET | /api/transactions/analytics | Chart data (optional startDate, endDate) |
| GET | /api/budgets | Budgets with spent amounts (query: month, year) |
| POST | /api/budgets | Create budget |
| PUT | /api/budgets/:id | Update amount |
| DELETE | /api/budgets/:id | Delete budget |

## Deployment
- Database: MongoDB Atlas (allow your host's IPs under Network Access)
- Backend: Render. Set the server env vars, `NODE_ENV=production`, and `CLIENT_URL` to your frontend URL. Start command: `npm start`, root directory: `server`
- Frontend: Vercel. Root directory `client`, set `VITE_API_URL` to `https://<your-backend>/api`
- Cross-site cookies need HTTPS, which both hosts provide. Check each host's current free-tier limits.

## Testing checklist
Register/login/logout, add/edit/delete, balance correctness, filters, invalid input, refresh persistence, and user isolation (log in as a second user and try opening user one's transaction ID: it should return 404).

## Future improvements
Login rate limiting, pagination in the UI, CSV export, recurring transactions, automated tests.

## Screenshots
Add screenshots here after you run the app.
