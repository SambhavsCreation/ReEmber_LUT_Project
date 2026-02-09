# test_app (Next.js)

Minimal Next.js app with a basic authentication flow using the Django backend hosted at:

`https://rs7vip8vmn.us-east-1.awsapprunner.com/`

## What it does

- Registration page creates users with email/password via backend: `POST /api/auth/register`.
- Confirmation page verifies sign-up code via backend: `POST /api/auth/confirm-signup`.
- Login page signs in with email/password via backend: `POST /api/auth/login`.
- After login, app stores JWT in an `httpOnly` cookie.
- Protected dashboard validates session via backend endpoint: `GET /api/auth/me`.
- Logout clears the session cookie.

## Backend used

By default this app points to:

`https://rs7vip8vmn.us-east-1.awsapprunner.com`

Override with env var if needed:

`BACKEND_BASE_URL=https://your-backend`

## Run locally

1. Install dependencies:
   - `npm install`
2. Optional: create `.env.local`:
   - `BACKEND_BASE_URL=https://rs7vip8vmn.us-east-1.awsapprunner.com`
3. Start dev server:
   - `npm run dev`
4. Open:
   - `http://localhost:3000`

## Routes

- `/login` login page
- `/register` registration page
- `/confirm-signup` signup confirmation page
- `/` redirects to `/login`
- `/dashboard` protected page
- `/api/login` local route that signs in via backend and sets cookie
- `/api/register` local route that proxies backend registration
- `/api/confirm-signup` local route that proxies backend confirmation
- `/api/resend-signup-code` local route that proxies backend resend-code
- `/api/logout` local route that clears cookie
- `/api/session` local route that checks current session against backend
